exports.index = async ctx => {
}

exports.playlistById = async ctx => {
	const playlists = await service.database.get({ playlistId: ctx.params.playlistId })
	ctx.state = {
		playlists,
	}

	await ctx.render('curate-playlists.ejs')
}