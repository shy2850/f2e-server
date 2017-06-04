const fs = require('fs')
const url = require('url')
const path = require('path')
const getConfig = require('../conf/get')
const directory = require('./directory')

const {
    handleError,
    handleSuccess,
    handleNotFound
} = require('../util/resp')

const app = (req, resp) => {
    const location = url.parse(decodeURIComponent(req.url))

    // 获取 host & port
    let [hostname, port = 80] = req.headers.host.split(':')
    if (req.client.ssl) {
        port = 443
    }

    // 获取 config
    const conf = getConfig(hostname, port)
    const pathname = path.join(conf.root, location.pathname)

    fs.stat(pathname, (error, stats) => {
        if (error) {
            handleNotFound(resp, pathname, conf)
        } else if (stats.isFile()) {
            fs.createReadStream(pathname).pipe(handleSuccess(resp, pathname, conf))
        } else if (stats.isDirectory()) {
            fs.readdir(pathname, (err, files) => {
                if (err) {
                    handleError(resp, err, conf)
                } else {
                    directory.resolve(resp, pathname, location, conf)
                }
            })
        }
    })
}

module.exports = app
