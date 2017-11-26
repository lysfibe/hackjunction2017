exports.recommend = async ctx => {
	const params = ctx.params
	const trackID = params.trackId

	if (trackID != null) {
		const suggest = require('../../../services/suggest')
		const { recommendedPlaylists } = await suggest.suggestPlaylistsForTrack(trackID)

		const text = await service.snippet('partials/demo-list.ejs', { playlists: recommendedPlaylists })

		ctx.type = 'text/html'
		ctx.body = text
	} else {
		ctx.status = 422
		ctx.body = 'missing data'
	}
}

exports.create = async ctx => {
	const { trackId, playlistId } = ctx.request.body
	console.log(trackId, playlistId)
	const track = await service.spotify.getTrack(trackId)
	console.log(track)
	ctx.body = track
}

exports.find = async ctx => {
	const { playlist, curator } = ctx.query

	if (playlist != null && curator != null) {
		ctx.body = { message: 'Only one query type should be provided' }
		ctx.status = 422
	} else {
		let response = null
		if (playlist != null) {
			response = { foo: 123 } // await myCallForData()
		} else {
			response = { foo: 456 } // await myCallForData()
		}

		ctx.body = response
	}
}