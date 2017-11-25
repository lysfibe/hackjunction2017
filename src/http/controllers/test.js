exports.sayHello = async ctx => {
	ctx.body = "<!DOCTYPE html><html><body><h1>Hello test</hi></body></html>"
	await services.cache.set("foo", Math.random())
	await (new Promise((r) => setTimeout(r, 250)))
	console.log(await services.cache.get("foo"), await services.cache.get("oip"))
}

exports.view = async ctx => {
	ctx.state = {
		title: 'My Title'
	}

	await ctx.render('hello.ejs')
}