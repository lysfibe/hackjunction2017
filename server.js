require('./bootstrap')

const app = new (require('@commander-lol/server'))

app.routes(require('./src/http'))

app.listen(env('port'))