const controller = (name, method) => require(`./controllers/${name}`)[method]

module.exports = function defineRoutes(router) {
	router.get('/', controller('submission', 'index'))
	
	router.get('/submission', controller('submission', 'index'))
	router.get('/submission/playlists', controller('submission', 'playlists'))

	router.get('/curate', controller('curate', 'index'))
	router.get('/curate/:playlistId', controller('curate', 'playlistById'))

	router.group('/api', api => {
		api.get('/demos', controller('api/demos', 'find'))
		api.post('/demos', controller('api/demos', 'create'))
		api.get('/tracks/:trackId/recommendations', controller('api/demos', 'recommend'))

		api.get('/suggestions/:trackId', controller('api/suggestions', 'trackById'))

		api.get('/artists/:artistId', controller('api/artists', 'findById'))
	})
}