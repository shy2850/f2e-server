const fs = require('fs')
const url = require('url')
const path = require('path')
const Resp = require('../util/resp')

module.exports = (req, resp, next, conf) => {
    const location = url.parse(decodeURIComponent(req.url))
    const pathname = path.join(conf.root, location.pathname)
    const {
        handleError,
        handleSuccess,
        handleNotFound
    } = Resp(conf)

    const directory = (pathname, location) =>
        fs.readdir(pathname, (error, files) => {
            const base = (location.pathname + '/').replace(/\/+/g, '/')
            if (error) {
                handleError(resp, error)
            } else {
                let items = ['../'].concat(files.filter(n => !n.match(/^\./)))
                let html = items
                    .map(name => '<a href="' + url.resolve(base, name) + '">' + name + '</a>')
                    .join('</li><li>')
                handleSuccess(req, resp, 'html').end('<meta charset="utf-8"/> <ul><li>' + html + '</li></ul>')
            }
        })
    fs.stat(pathname, (error, stats) => {
        if (error) {
            handleNotFound(resp, pathname)
        } else if (stats.isFile()) {
            handleSuccess(req, resp, pathname) && fs.createReadStream(pathname).pipe(resp)
        } else if (stats.isDirectory()) {
            fs.readdir(pathname, (err, files) => {
                if (err) {
                    handleError(resp, err)
                } else {
                    directory(pathname, location)
                }
            })
        }
    })
}
