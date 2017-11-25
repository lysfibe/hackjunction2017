exports.findById = async ctx => {
	const { artistId } = ctx.params

	const request = { artistId }

	ctx.body = request
}