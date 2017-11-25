const request = require('request-promise')

class SpotifySerializer {
	static get SpotifySerializer() { return SpotifySerializer }

  async parseArtistData(artistData, albumData) {
    let fullArtistData = artistData;
    fullArtistData["albums"] = albumData;
    return fullArtistData;
  }
}

module.exports = new SpotifySerializer()
