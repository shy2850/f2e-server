const server = require('./lib/server/index')
const middlewares = {
    babel: require('./lib/middleware/babel'),
    include: require('./lib/middleware/include'),
    less: require('./lib/middleware/less'),
    livereload: require('./lib/middleware/ServerSent')
}

Object.assign(server, {
    middlewares,
    Route: require('./serve/Route'),
    out: {
        JsonOut: require('./serve/out/JsonOut'),
        JsonpOut: require('./serve/out/JsonpOut'),
        ServerSent: require('./serve/out/ServerSent')
    }
})

module.exports = server
