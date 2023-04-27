const http = require('http')
const https = require('https')
const entry = require('./entry')

const createServer = (port, options) => {
    let server
    if (port === 443) {
        server = https.createServer(options, entry).listen(port)
    } else {
        server = http.createServer(entry).listen(port)
    }
    return server
}

module.exports = createServer
