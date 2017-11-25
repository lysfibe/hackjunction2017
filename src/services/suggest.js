const spotify = require('./spotify');
const Playlist = require('../domain/playlist');

const PLAYLIST_FOLLOWERS_MIN = 100;
const PLAYLIST_TRACKS_MIN = 10;
const DESIRED_PLAYLISTS_FROM_SEARCH = 50;
const MAX_API_CALLS_PER_REQUEST = 200;

class Suggest {

    static async suggestPlaylistsForTrack(trackID) {

        const track = await spotify.getTrack(trackID);

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
            recommendedPlaylists: playlists.map(Suggest._formatPlaylist)
        }
    }

    /**
     * Converts a playlist to a lightweight format.
     */
    static _formatPlaylist(p) {
        return {
            id: p.id,
            href: p.href,
            name: p.name,
            description: p.description,
            image: p.image,
            followerCount: p.followerCount,
            trackCount: p.trackCount,
            //dateEdited: p.dateEdited(),
            curator: p.curator
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

        // TODO - Refine results
        // How recently music was added to the playlist 
        // How recent the music in the playlist is
        // Playlist length (saturation mitigation)
        // Genre relevance
        // Popularity of music in the list 
        // Diversity of artists
        // Curator followers
        // How recent curator activity was
        // Number of playlists curator has

        return playlists;
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

        // Note: Only artists have genres on Spotify
        const q = Array.isArray(artist.genres)
            ? artist.genres.join(' OR ')
            : track.name;

        let apiCalls = 0;
        let offset = 0;
        let playlists = [];

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

                // Filter out curator=spotify?

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


                // Convert to Playlist class
                items = items.map(p => new Playlist(p));

                // Add to results
                playlists = playlists.concat(items);

            } catch (err) {
                console.error(`Error suggesting playlists for "${track.name}"\n`, err);
                break;
            }
        }

        console.log(`Found ${playlists.length} suitable playlists for "${track.name}" using ${apiCalls} Spotify API calls\n`);
        return playlists;
    }

}

module.exports = Suggest;