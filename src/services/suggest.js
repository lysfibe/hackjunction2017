const spotify = require('./spotify');
const Playlist = require('../domain/playlist');

const PLAYLIST_FOLLOWERS_MIN = 100;
const PLAYLIST_TRACKS_MIN = 10;

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
        // PlaylistObject.length() 
        // Genre relevance
        // Popularity of music in the list 
        // Curator followers
        // How recent curator activity was
        // Number of playlists curator has

        return playlists;
    }

    /**
     * Full text search for playlists by artist genres or track name.
     */
    static async _searchForPlaylists(track, artist) {

        // Note: Only artists have genres on Spotify
        const q = Array.isArray(artist.genres)
            ? artist.genres.join(' OR ')
            : track.name;

        console.log(`Searching for playlists for "${track.name}"`);
        const response = await spotify.search({
            q,
            type: 'playlist',
            limit: 50
        });

        let playlists = response.playlists.items;
        let apiCalls = playlists.length;

        // Filter out short playlists
        playlists = playlists.filter(p => p.tracks.total >= PLAYLIST_TRACKS_MIN);

        // Get full playlist details
        console.log(`Requesting playlist details for "${track.name}"`);
        const lookupPlaylist = p => spotify.getPlaylist(p.owner.id, p.id);
        playlists = await Promise.all(playlists.map(lookupPlaylist));
        apiCalls += playlists.length;

        // Filter out insignificant playlists
        playlists = playlists.filter(p => p.followers.total >= PLAYLIST_FOLLOWERS_MIN);

        // Get full owner details
        console.log(`Requesting curator details for "${track.name}"`);
        const lookupOwner = async p => {
            p.owner = await spotify.getUser(p.owner.id);
            return p;
        };
        playlists = await Promise.all(playlists.map(lookupOwner));
        apiCalls += playlists.length;

        console.log(`Found ${playlists.length} suitable playlists for "${track.name}" using ${apiCalls} Spotify API calls`);
        return playlists.map(p => new Playlist(p));
    }

}

module.exports = Suggest;