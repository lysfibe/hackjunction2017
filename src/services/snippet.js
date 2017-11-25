const ejs = require('ejs')
module.exports = function renderSnippetFile(path, data, options) {
	const fullPath = fromRoot('views', path)
	return new Promise((resolve, reject) => {
		ejs.renderFile(fullPath, data, options, (err, str) => {
			if (err) reject(err)
			else resolve(str)
		})
	})
}