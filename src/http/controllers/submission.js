exports.index = async ctx => {
    ctx.state = {
		// title: 'My Title'
	}

	await ctx.render('submissions.ejs')
}

exports.playlists = async ctx => {
	const { trackId } = ctx.params

	const data = [ { playlists: 'ja' } ]

	ctx.state = {
		playlists: data,
	}

	await ctx.render('submission-playlists.ejs')
}