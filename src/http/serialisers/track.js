module.exports = function serialiseTrack(track) {
	console.log(track)
	const image = track.album.images.length > 0 ? track.album.images[0] : { url: null }
	console.log(image)
	return Object.assign(
		{},
		track,
		{
			artist: track.artists[0],
			image: image.url,
		}
	)
}