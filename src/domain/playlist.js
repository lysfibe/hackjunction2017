
class Playlist {

    constructor(par) {

        // Preserve Spotify data as 'source' property
        this.source = par;

        // Simple fields
        this.id = par.id;
        this.href = par.href;
        this.name = par.name;
        this.description = par.description;
        this.followerCount = par.followers.total;
        this.trackCount = par.tracks.total;

        // Date of most recent addition
        const additionDates = par.tracks.items.map(t => new Date(t.added_at));
        this.dateEdited = new Date(Math.max.apply(null, additionDates));

        // Playlist image
        const hasImage = Array.isArray(par.images) && par.images.length;
        if (hasImage) this.image = par.images[0].url;

        // Curator image
        let curatorImage;
        const hasCuratorImage = Array.isArray(par.owner.images) && par.owner.images.length;
        if (hasCuratorImage) curatorImage = par.owner.images[0].url;

        // Curator details
        this.curator = {
            id: par.owner.id,
            href: par.owner.href,
            name: par.owner.display_name,
            image: curatorImage,
            followerCount: par.owner.followers.total
            // TODO playlistCount
            // TODO dateActive
        }
    }

    get getRecentRating() {
        const difference = parseInt((new Date() - this.dateEdited) / (1000 * 60 * 60 * 24));
        if (difference > 100) {
          return 0;
        }
        else {
          return 100 - difference;
        }
    }

    get getPopularityRating() {
        return 3;
    }

    get getCuratorPlaylistCount() {
        return 3;
    }

    /**
     * Returns a clone of the playlist without source information.
     */
    get simplified() {
        const simplified = JSON.parse(JSON.stringify(this));
        delete simplified.source;
        return simplified;
    }

}

module.exports = Playlist;
