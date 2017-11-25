
class Playlist {

    constructor(par) {
        // Preserve Spotify data
        this.source = par;

        // Copy fields directly
        this.id = par.id;
        this.href = par.href;
        this.name = par.name;
        this.description = par.description;

        // Counts
        this.followerCount = par.followers ? par.followers.total : 0;
        this.trackCount = par.tracks ? par.tracks.total : 0;

        // Playlist image
        const hasImage = Array.isArray(par.images) && par.images.length;
        if (hasImage) this.image = par.images[0].url;

        // Curator image
        const hasCuratorImage = Array.isArray(par.owner.images) && par.owner.images.length;
        let curatorImage;
        if (hasCuratorImage) curatorImage = par.owner.images[0].url;

        //this.dateEdited = undefined; // TODO - maybe get from last added track?

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

    get getRecentRating(){
      return 3;
    }

    get getPlaylistLength(){
      return 3;
    }

    get getPopularityRating(){
      return 3;
    }

    get getCuratorFollowersCount(){
      return 3;
    }

    get getCuratorPlaylistCount() {
      return 3;
    }

  }

module.exports = Playlist;
