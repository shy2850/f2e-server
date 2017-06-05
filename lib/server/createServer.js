const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
const entry = require('./entry')

const options = {
    key: fs.readFileSync(path.resolve(__dirname, '../../keys/key.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, '../../keys/key-cert.pem'))
}

const createServer = port => {
    if (port === 443) {
        https.createServer(options, entry).listen(port)
    } else {
        http.createServer(entry).listen(port)
    }
}

module.exports = createServer
