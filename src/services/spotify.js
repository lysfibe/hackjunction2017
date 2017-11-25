const request = require('request-promise')

class Spotify {
	static get Spotify() { return Spotify }

	async _request (uri, method, opts) {
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

			console.log(token)
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

	async getUserPlaylists(id) {
		return this._request(`users/${id}/playlists`)
	}
}

module.exports = new Spotify()