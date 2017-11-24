exports.sayHello = async ctx => {
	ctx.body = "<!DOCTYPE html><html><body><h1>Hello test</hi></body></html>"
	await (new Promise((r) => setTimeout(r, 250)))
}

exports.view = async ctx => {
	ctx.state = {
		title: 'My Title'
	}

	await ctx.render('hello.ejs')
}