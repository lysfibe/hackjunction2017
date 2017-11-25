exports.trackById = async ctx => {
	const { trackId } = ctx.params

	const response = { foo: 123 } // await myCallForData()

	ctx.body = response
}
