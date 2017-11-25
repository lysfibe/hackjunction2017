exports.create = async ctx => {
	const params = ctx.request.body
	const trackID = params.trackID

	if (trackID != null) {
		const suggest = require('../../../services/suggest')
		const suggestedPlaylists = suggest.suggestPlaylistsForTrack(trackID)

		ctx.body = suggestedPlaylists
	} else {
		ctx.status(422)
		ctx.body = 'missing data'
	}
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