const request = require('request-promise')

class Spotify {
	static get Spotify() { return Spotify }

	async getRelatedArtists(id) {
		const foo = request(...params)
		return foo
	}
}

module.exports = new Spotify()