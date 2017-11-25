require('dotenv').config()

global.env = (name, fallback = null) => {
	if (process.env.hasOwnProperty(name)) return process.env[name]
	if (process.env.hasOwnProperty(name.toUpperCase())) return process.env[name.toUpperCase()]
	return fallback
}

global.service = {
	get cache() {
		return require('./src/services/cache')
	},

	get spotify() {
		return require('./src/services/spotify')
	},

	get database() {
		return require('./src/services/database')
	}
}