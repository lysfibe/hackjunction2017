require('./bootstrap')

const app = new (require('@commander-lol/server'))
const views = require('koa-views');
const pathUtil = require('path')

// Must be used before any router is used
app.use(views(pathUtil.join(__dirname , 'views'), {
	map: {
		html: 'ejs',
	},
	options: {
		helpers: {
			uppercase: (str) => str.toUpperCase()
		},

		partials: {
			subTitle: './partials/my-partial' // requires ./partials/my-partial.ejs
		}
	}
}))

app.serve("/", pathUtil.join(__dirname, 'public'))

app.routes(require('./src/http'))

app.listen(env('port'))