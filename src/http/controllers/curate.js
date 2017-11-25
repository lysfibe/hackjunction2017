const moment = require('moment')

exports.index = async ctx => {
}

exports.playlistById = async ctx => {
	// const data = await service.database.get({ playlistId: ctx.params.playlistId })

	const data = [
		{
			playlist: {
				id: 123,
				href: 'http://playlist.url',
				name: 'Call me maybe remixes',
				image: 'http://lorempixel.com/g/120/120',
				trackCount: 123,
				curator: {
					id: 123,
					href: 'http://my-profile.url',
					name: 'Carlene Jepson',
					image: 'http://lorempixel.com/g/120/120',
					followerCount: 12,
					playlistCount: 5,
					dateActive: moment(),
				},
			},
			track:
				{
					id: 123,
					href: 'http://track.url',
					name: 'Call Me Maybe (Turbo Dance Remix)',
					length: 234,
					image: 'http://lorempixel.com/g/120/120',
					popularity: 0.8,
					artist:
						{
							id: 123,
							name: 'Carly Fan The Carrly Man',
						},
				},
		},

		{
			playlist: {
				id: 123,
				href: 'http://playlist.url',
				name: 'Call me maybe remixes',
				image: 'http://lorempixel.com/g/120/120',
				trackCount: 123,
				curator: {
					id: 123,
					href: 'http://my-profile.url',
					name: 'Carlene Jepson',
					image: 'http://lorempixel.com/120/120',
					followerCount: 12,
					playlistCount: 5,
					dateActive: moment(),
				},
			},
			track:
				{
					id: 123,
					href: 'http://track.url',
					name: 'Call Me Maybe (3x Triple Deathcore edition)',
					length: 234,
					image: 'http://lorempixel.com/120/120',
					popularity: 0.8,
					artist:
						{
							id: 123,
							name: 'Carly Fan The Carrly Man',
						},
				},
		},
	]

	ctx.state = {
		tracks: data.map(blob => Object.assign(blob, { track: Object.assign(blob.track, { length: lengthToTime(blob.track.length) }) } )),
	}

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