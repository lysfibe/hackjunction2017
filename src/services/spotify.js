const request = require('request-promise')

class Spotify {
	static get Spotify() { return Spotify }

	async _request (uri, method = 'GET', opts = {}) {
		const token = await this._auth()

		const headers = opts.headers ?
			Object.assign({ Authorization: `Bearer ${token}` }, opts.headers)
			: { Authorization: `Bearer ${token}` }

		const payload = Object.assign({
			uri: `https://api.spotify.com/v1/${uri}`,
			method,
		}, opts, {
			headers,
			json: true,
		})

		return request(payload)
	}

	async _auth() {
		return service.cache.rememberFor('spotify-access-token', 1, async () => {
			const id = env('spotify_client_id')
			const secret = env('spotify_client_secret')

			const token = new Buffer(`${id}:${secret}`).toString('base64')

			const result = await request({
				uri: 'https://accounts.spotify.com/api/token',
				method: 'POST',
				headers: {
					Authorization: `Basic ${token}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: `grant_type=client_credentials`,
				json: true,
			})
			return result.access_token
		})
	}

	async getPlaylist(userID, playlistID) {
		return this._request(`users/${userID}/playlists/${playlistID}`)
	}

	async getUserPlaylists(id) {
		return this._request(`users/${id}/playlists`)
	}

	async getArtist(id) {
		return this._request(`artists/${id}`)
	}

	async getUser(id) {
		return this._request(`users/${id}`)
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