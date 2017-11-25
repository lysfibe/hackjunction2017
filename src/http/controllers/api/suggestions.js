const suggest = require('../../../services/suggest')

exports.trackById = async ctx => {
	const { trackId } = ctx.params

	const response = await suggest.suggestPlaylistsForTrack(trackId)

	ctx.body = response
}
