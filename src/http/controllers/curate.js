const moment = require('moment')
const serialseTrack = require('../serialisers/track')

exports.index = async ctx => {
}

exports.playlistById = async ctx => {
	console.log(ctx.params.playlistId)
	const data = await service.database.find({ playlistId: ctx.params.playlistId })

	const tracks = await Promise.all(data.map(async ({ trackId, playlistId, curatorId }) => {
		console.log(trackId, playlistId)
		const [track, playlist] = await Promise.all([
			service.spotify.getTrack(trackId),
			service.spotify.getPlaylist(curatorId, playlistId),
		])

		return {
			track: serialseTrack(track),
			playlist,
		}
	}))

	console.log("LIST", tracks)

	ctx.state = { tracks }

	await ctx.render('curate-playlist.ejs')
}

function pad(str, len) {
	if (str.length >= len) return str
	return (new Array(len - str.length)).fill('0').join() + str
}
function lengthToTime(timeInSeconds) {
	const minutes = Math.floor(timeInSeconds / 60)
	const seconds = timeInSeconds % 60

	console.log(minutes, seconds)

	return `${pad(String(minutes), 2)}:${pad(String(seconds), 2)}`
}