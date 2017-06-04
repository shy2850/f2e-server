const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
const IP = require('../util/IP')
const app = require('./app')

const options = {
	key: fs.readFileSync(path.resolve(__dirname, '../../keys/key.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, '../../keys/key-cert.pem'))
}

const createServer = port => {
	if (port === 443) {
		https.createServer(options, app).listen(port)
	}
	else {
		http.createServer(app).listen(port)
	}
}

module.exports = createServer