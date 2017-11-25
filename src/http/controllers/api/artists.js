const spotify = require('../../../services/spotify')

exports.findById = async ctx => {
	const { artistId } = ctx.params

	const response = await spotify.getArtist(artistId)
	
	ctx.body = response
}
