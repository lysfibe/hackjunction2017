const stats = require("stats-lite");

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

        // Calculate audio features
        this.features = this._calculateFeatures();

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

    /**
     * Calculates the mean and variance of all audio features.
     */
    _calculateFeatures() {
        try {
            // Calculate the mean and variance of a property across the playlist
            const mv = (propName) => {
                const values = this.source.tracks.features.map(t => t[propName]);
                return { mean: stats.mean(values), variance: stats.variance(values) }
            };

            return {
                danceability: mv("danceability"),
                energy: mv("energy"),
                key: mv("key"),
                loudness: mv("loudness"),
                mode: mv("mode"),
                speechiness: mv("speechiness"),
                acousticness: mv("acousticness"),
                instrumentalness: mv("instrumentalness"),
                liveness: mv("liveness"),
                valence: mv("valence"),
                tempo: mv("tempo"),
                duration_ms: mv("duration_ms"),
                time_signature: mv("time_signature")
            }
        }
        catch (err) {
            console.error(`Failed to calculate audio features for playlist "${this.name}"`);
        }
    }

    /**
     * Compares an audio feature value to the playlist statistics.
     * Greater difference implies a lower score.
     * Lower variance implies greater magnitude.
     */
    compareFeature(feature, value) {
        const pl = this.features[feature]
        const score = 0 - (Math.abs(pl.mean - value) / pl.variance);
        //console.log(`${feature}: ${score}, Value ${value}, Mean ${pl.mean}, Variance ${pl.variance}`);
        return score;
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
        delete simplified.features;
        return simplified;
    }

}

module.exports = Playlist;
