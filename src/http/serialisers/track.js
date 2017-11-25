module.exports = function serialiseTrack(track) {
	console.log(track)
	return Object.assign(
		{},
		track,
		{ artist: track.artists[0] }
	)
}