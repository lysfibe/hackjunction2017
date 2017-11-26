const spotify = require('./spotify');
const Playlist = require('../domain/playlist');

const PLAYLIST_FOLLOWERS_MIN = 100;
const PLAYLIST_TRACKS_MIN = 5;
const DESIRED_PLAYLISTS_FROM_SEARCH = 50;
const MAX_API_CALLS_PER_REQUEST = 200;
const DISALLOW_GENERATED_PLAYLISTS = true;

class Suggest {

    static async suggestPlaylistsForTrack(trackID) {

        const track = await spotify.getTrack(trackID);

        track.features = await spotify.getFeaturesForTrack(trackID);

        if (!Array.isArray(track.artists)) throw 'No artists found for track';

        // Note: Tracks can have multiple artists, we are just using the first.
        const artistID = track.artists[0].id;

        const artist = await spotify.getArtist(artistID);

        const playlists = await Suggest._searchAndRefine(track, artist);

        return Suggest._formatResponse(track, artist, playlists);
    }

    /**
     * Converts Spotify track, artist, and (an array of) playlist formats 
     * to a suggestion resource.
     */
    static _formatResponse(track, artist, playlists) {
        playlists = playlists || [];
        return {
            // TODO reasons
            track: {
                id: track.id,
                href: track.href,
                name: track.name,
                length: track.duration_ms,
                popularity: track.popularity,
                artist: {
                    id: artist.id,
                    href: artist.href,
                    name: artist.name
                }
            },
            recommendedPlaylists: playlists.map(p => p.simplified)
        }
    }


    /**
     * Returns an ordered array of playlists suitable for 
     * inclusion of track created by artist.
     */
    static async _searchAndRefine(track, artist) {

        if (!track) throw 'Track is required for playlist recommendation';
        if (!artist) throw 'Artist is required for playlist recommendation';

        let playlists = await Suggest._searchForPlaylists(track, artist);

        playlists = Suggest._calculateFeatureMatchScores(playlists, track);

        // TODO - Refine results
        // [x] How recently music was added to the playlist 
        // [x] Music features
        // [x] Playlist followers
        // [x] Playlist length (saturation mitigation)
        // [~] Genre relevance
        // [ ] How recent the music in the playlist is
        // [ ] Popularity of music in the list 
        // [ ] Diversity of artists
        // [x] Curator followers
        // [ ] How recent curator activity was
        // [ ] Number of playlists curator has

        // Combine multiple scores using weights
        playlists = playlists.map(p => {
            // Add scoring criteria here (name, value, weight)
            p.addScore('activity', p.recentRating, 4);
            p.addScore('features', p.featureScores.average, 3);
            p.addScore('popularity', p.followerRating, 2);
            p.addScore('prestige', p.curatorFollowerRating);
            p.addScore('length', p.lengthRating);
            return p;
        });

        // Sort by weighted score (descending)
        const srt = (a, b) => a.scores.weightedTotal > b.scores.weightedTotal ? -1 : 1;
        return playlists.sort(srt);
    }

    /**
     * Full text search for playlists by artist genres or track name.
     */
    static async _searchForPlaylists(track, artist) {

        const lookupPlaylistDetails = p => spotify.getPlaylist(p.owner.id, p.id);

        const lookupPlaylistOwner = async p => {
            p.owner = await spotify.getUser(p.owner.id);
            return p;
        };

        const lookupTrackAnalysis = async p => {
            p.tracks.features = [];
            const ids = p.tracks.items.map(t => t.track.id);

            let batches = [];
            while (ids.length > 0) {
                batches.push(ids.splice(0, 100));
            }

            const responses = await Promise.all(batches.map(ids => spotify.getFeaturesForTracks(ids)));
            responses.map(r => p.tracks.features = p.tracks.features.concat(r.audio_features));
            // Note: This should probably merge by id with tracks.items
        };

        // Note: Only artists have genres on Spotify
        const q = Array.isArray(artist.genres)
            ? artist.genres.join(' OR ')
            : track.name;

        let apiCalls = 0;
        let offset = 0;
        let playlists = [];

        console.log();
        while (playlists.length < DESIRED_PLAYLISTS_FROM_SEARCH
            && apiCalls < MAX_API_CALLS_PER_REQUEST) {

            try {

                // REQUEST results from full-text search
                console.log(`Searching for playlists for "${track.name}"`);
                const response = await spotify.search({
                    q, offset,
                    type: 'playlist',
                    limit: 50
                });
                apiCalls += 1;
                offset += 50;
                let items = response.playlists.items;

                // Stop searching if no more results
                if (!items.length) break;


                // FILTER out playlists generated by Spotify
                if (DISALLOW_GENERATED_PLAYLISTS) {
                    items = items.filter(p => p.owner.id !== 'spotify');
                }


                // FILTER out short playlists
                items = items.filter(p => p.tracks.total >= PLAYLIST_TRACKS_MIN);


                // REQUEST full playlist details
                console.log(`Requesting playlist details for "${track.name}"`);
                apiCalls += items.length;
                items = await Promise.all(items.map(lookupPlaylistDetails));


                // FILTER out playlists with few followers
                items = items.filter(p => p.followers.total >= PLAYLIST_FOLLOWERS_MIN);


                // REQUEST full owner details
                console.log(`Requesting curator details for "${track.name}"`);
                apiCalls += items.length;
                items = await Promise.all(items.map(lookupPlaylistOwner));


                // REQUEST all playlist tracks
                console.log(`Requesting all tracks for playlists for "${track.name}"`);
                items = await Promise.all(items.map(async p => {
                    if (p.tracks.next) {
                        p.tracks = await spotify.depaginate(p.tracks);
                    }
                    return p;
                }));


                // REQUEST audio features for each track in the playlist
                // Note: Playlist tracks are paginated, so some may be missing
                console.log(`Requesting track audio features for "${track.name}"`);
                apiCalls += items.length;
                await Promise.all(items.map(lookupTrackAnalysis));


                // Add to results
                playlists = playlists.concat(items);

            } catch (err) {
                console.error(`Error suggesting playlists for "${track.name}":\n`, err.error || err);
                break;
            }
        }

        console.log(`Found ${playlists.length} suitable playlists for "${track.name}" using ${apiCalls} Spotify API calls`);

        // Convert to Playlist class
        console.log(`Processing playlist data for "${track.name}"`);
        return playlists.map(p => new Playlist(p));
    }



    // FEATURE MATCHING --------------------------------------------------------

    /**
     * Returns an array of numbers ranged 0 to 100 representing the fitness 
     * of the track to the playlist in regards to that feature.
     * Fitness is defined by feature score which is inversely proportional 
     * to the difference between the track's value and the playlist average, 
     * and the variance of the playlist.
     */
    static _scaledFeatureMatchScore(feature, playlists, track) {

        // Accumulate feature scores
        let scores = [];
        playlists.map(p => {
            try {
                scores.push(p.compareFeature(feature, track.features[feature]));
            } catch (e) {
                scores.push('Unknown');
            }
        });
        // console.log(feature + ' (raw): ', scores);

        // Scale features
        const numbers = scores.filter(n => !isNaN(n));
        const scoresMin = Math.min(...numbers);
        const scoresMax = Math.max(...numbers);
        const scoresDiff = (scoresMax - scoresMin);
        scores = scores.map(n => {
            if (!isNaN(n)) {
                return Math.round(100 * (n - scoresMin) / scoresDiff)
            } else {
                return n;
            }
        });

        //console.log(`Min ${scoresMin}, Max ${scoresMax}, Diff ${scoresDiff}`);
        //console.log(feature + ' (scaled): ', scores);
        return scores;
    }

    static _calculateFeatureMatchScores(playlists, track) {
        const features = [
            "danceability",
            "energy",
            "key",
            "loudness",
            "mode",
            "speechiness",
            "acousticness",
            "instrumentalness",
            "liveness",
            "valence",
            "tempo",
            "duration_ms",
            "time_signature"
        ];

        // Generate matrix of features by playlists
        const mat = features.map(f => Suggest._scaledFeatureMatchScore(f, playlists, track));

        // Tally
        for (let i = 0; i < playlists.length; i++) {
            const p = playlists[i];

            p.featureScores = { total: 0 };

            for (let j = 0; j < mat.length; j++) {
                // Save score for feature
                p.featureScores[features[j]] = mat[j][i];

                // Add score to total
                if (!isNaN(mat[j][i])) p.featureScores.total += mat[j][i];
            };

            // Calculate Average
            p.featureScores.average = Math.round(p.featureScores.total / features.length);
        }

        return playlists;
    }

}

module.exports = Suggest;