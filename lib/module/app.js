const fs = require('fs')
const url = require('url')
const path = require('path')
const directory = require('./directory')

const {
    handleError,
    handleSuccess,
    handleNotFound
} = require('../util/resp')

module.exports = (req, resp, next, conf) => {
    const location = url.parse(decodeURIComponent(req.url))
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
