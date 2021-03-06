exports.recommend = async ctx => {
	const params = ctx.params
	const trackID = params.trackId

	if (trackID != null) {
		const suggest = require('../../../services/suggest')
		const { recommendedPlaylists } = await suggest.suggestPlaylistsForTrack(trackID)


		console.log(recommendedPlaylists)
		
		const text = await service.snippet('partials/demo-list.ejs', { playlists: recommendedPlaylists })

		ctx.type = 'text/html'
		ctx.body = text
	} else {
		ctx.status = 422
		ctx.body = 'missing data'
	}
}

exports.create = async ctx => {
	const errors = ctx.validate({
		trackId: trackId => !!trackId ? null : 'Track ID must be present',
		playlistId: playlistId => !! playlistId ? null : 'Playlist ID must be present',
		curatorId: curatorId => !! curatorId ? null : 'Curator ID must be present',
	})

	if (errors) {
		ctx.body = errors
		ctx.status = 422
		return
	}

	const { trackId, playlistId, curatorId } = ctx.request.body

	console.log(trackId, playlistId, curatorId)

	const track = await service.spotify.getTrack(trackId)

	console.log(track)
	if (track.artists.length > 0) {
		const [ artist ] = track.artists
		const re = await service.database.insert({
			trackId,
			playlistId,
			curatorId,
			artistId: artist.id,
		})

		console.log(re)

		ctx.body = {
			message: 'success',
			ok: true,
		}
	} else {
		ctx.status = 500
		ctx.body = { message: 'OH DAMN SON', ok: false }
	}
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