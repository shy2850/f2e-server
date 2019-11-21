const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
const entry = require('./entry')
const options = {
    key: fs.readFileSync(path.join(__dirname, '../../keys/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../../keys/key-cert.pem'))
}

const createServer = port => {
    let server
    if (port === 443) {
        server = https.createServer(options, entry).listen(port)
    } else {
        server = http.createServer(entry).listen(port)
    }
    return server
}

module.exports = createServer
