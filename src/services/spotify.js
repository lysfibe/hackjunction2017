const request = require('request-promise')

class Spotify {
	static get Spotify() { return Spotify }

	_request (uri, method, opts) {
		const payload = {
			uri: `https://api.spotify.com/v1/${uri}`,
			method,
			...opts,
			json: true,
		}

		return request(payload)
	}

	async getUserPlaylists(id) {
		return this._request(`users/${id}/playlists`)
	}
}

module.exports = new Spotify()