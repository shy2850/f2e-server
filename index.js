const server = require('./lib/server/index')
const middlewares = {
    babel: require('./lib/middleware/babel'),
    include: require('./lib/middleware/include'),
    less: require('./lib/middleware/less'),
    livereload: require('./lib/middleware/ServerSent')
}

Object.assign(server, {
    middlewares
})

module.exports = server
