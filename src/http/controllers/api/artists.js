const spotify = require('../../../services/spotify')
const spotifySerializer = require('../../../services/spotifySerializer')

exports.findById = async ctx => {
	const { artistId } = ctx.params

	const artistData = await spotify.getArtist(artistId)
	const albumData = await spotify.getArtistAlbums(artistId);

	ctx.body = await spotifySerializer.parseArtistData(artistData, albumData);
}
