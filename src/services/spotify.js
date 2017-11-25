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

	async getArtist(id) {
		return this._request(`artists/${id}`)
	}

	async getTrack(id) {
		return this._request(`tracks/${id}`)
	}

	async getTracks(ids) {
		if (!Array.isArray(ids)) throw 'getTracks requires an array of ids'
		return this._request(`search`, 'GET', { qs: { ids } })
	}

	async search(qs) {
		return this._request(`search`, 'GET', { qs })
	}
}

module.exports = new Spotify()