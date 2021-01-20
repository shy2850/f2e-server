const server = require('./lib/server/index')
const middlewares = {
    include: require('./lib/middleware/include'),
    less: require('./lib/middleware/less'),
    livereload: require('./lib/middleware/livereload')
}

Object.assign(server, {
    middlewares
})

module.exports = server
