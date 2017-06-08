const fs = require('fs')
const url = require('url')
const path = require('path')
const {
    handleError,
    handleSuccess,
    handleNotFound
} = require('../util/resp')

const directory = (resp, pathname, location, conf) =>
    fs.readdir(pathname, (error, files) => {
        const base = (location.pathname + '/').replace(/\/+/g, '/')
        if (error) {
            handleError(resp, error)
        } else {
            let items = ['../'].concat(files.filter(n => !n.match(/^\./)))
            let html = items
                .map(name => '<a href="' + url.resolve(base, name) + '">' + name + '</a>')
                .join('</li><li>')
            handleSuccess(resp, 'html').end('<meta charset="utf-8"/> <ul><li>' + html + '</li></ul>')
        }
    })

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
                    directory(resp, pathname, location, conf)
                }
            })
        }
    })
}
