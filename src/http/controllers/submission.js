exports.index = async ctx => {
    ctx.state = {
		// title: 'My Title'
	}

	await ctx.render('submissions.ejs')
}

exports.playlists = async ctx => {
	
}