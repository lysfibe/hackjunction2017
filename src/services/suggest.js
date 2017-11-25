const spotify = require('./spotify')

class Suggest {

    static async suggestPlaylistsForTrack(trackID) {

        const track = await spotify.getTrack(trackID);

        if (!Array.isArray(track.artists)) throw 'No artists found for track';

        // Note: Tracks can have multiple artists, we are just using the first.
        const artistID = track.artists[0].id;

        const artist = await spotify.getArtist(artistID);

        const playlists = await this._searchAndRefine(track, artist);

        return this._formatResponse(track, artist, playlists);
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
     * Converts Spotify's playlist format to our simplified format.
     */
    static _formatPlaylist(p) {

        // Image
        const hasImage = Array.isArray(p.images) && p.images.length;
        const image = hasImage ? p.images[0].url : undefined;

        // Counts
        const followerCount = p.followers ? p.followers.total : 0;
        const trackCount = p.tracks ? p.tracks.total : 0;

        const dateEdited = undefined; // TODO - maybe get from last added track?

        return {
            id: p.id,
            href: p.href,
            name: p.name,
            description: p.description,
            image,
            followerCount,
            trackCount,
            dateEdited
        }
    }

    /**
     * Returns an ordered array of playlists suitable for 
     * inclusion of track created by artist.
     */
    static async _searchAndRefine(track, artist) {

        if (!track) throw 'Track is required for playlist recommendation';
        if (!artist) throw 'Artist is required for playlist recommendation';

        let playlists = await this._searchForPlaylists(track, artist);

        // TODO Refine results

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

        const response = await spotify.search({
            q,
            type: 'playlist',
            limit: 50
        });

        return response.playlists.items;
    }

}

module.exports = Suggest;