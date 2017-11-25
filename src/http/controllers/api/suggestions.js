exports.trackById = async ctx => {
	const { trackId } = ctx.params

	const response = { foo: 123 } // await myCallForData()

	ctx.body = response
}

exports.create = async ctx => {
	const { ...params } = ctx.request.body

	const response = { foo: 123 } // await myCallForData()

	ctx.body = response
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