const controller = (name, method) => require(`./controllers/${name}`)[method]

module.exports = function defineRoutes(router) {
	router.get('/', controller('test', 'sayHello'))

	router.group('/api', api => {
		api.get('/', ctx => {
			ctx.body = { message: 'hello' }
		})
	})
}