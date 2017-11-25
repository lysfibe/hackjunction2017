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
    static async _formatResponse(track, artist, playlists) {
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
            recommendedPlaylists: playlists.map(this._formatPlaylist)
        }
    }

    /**
     * Converts Spotify's playlist format to our simplified format.
     */
    static async _formatPlaylist(p) {

        const hasImage = Array.isArray(p.images) && p.images.length;
        const image = hasImage ? p.images[0].url : undefined;

        const dateEdited = undefined; // TODO - maybe get from last added track?

        return {
            id: p.id,
            href: p.href,
            name: p.name,
            description: p.description,
            followerCount: p.followers.total,
            trackCount: p.tracks.total,
            image,
            dateEdited
        }
    }

    /**
     * Returns an ordered array of playlists suitable for 
     * inclusion of track created by artist.
     */
    static async _searchAndRefine(track, artist) {
        // TODO
        return [];
    }

}

module.exports = Suggest;