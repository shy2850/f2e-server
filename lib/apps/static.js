const fs = require('fs')
const url = require('url')
const zlib = require('zlib')
const path = require('path')
const Resp = require('../util/resp')

module.exports = (req, resp, next, conf) => {
    const location = url.parse(decodeURIComponent(req.url))
    let pathname = path.join(conf.root, location.pathname)

    if (conf.onRoute) {
        let routeResult = conf.onRoute(location.pathname, req, resp, {})
        if (routeResult === false) {
            return
        } else {
            pathname = routeResult ? path.join(conf.root, location.routeResult) : pathname
        }
    }
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
                handleSuccess(req, resp, 'html', '<meta charset="utf-8"/> <ul><li>' + html + '</li></ul>')
            }
        })
    fs.stat(pathname, (error, stats) => {
        if (error) {
            handleNotFound(resp, pathname)
        } else if (stats.isFile()) {
            handleSuccess(req, resp, pathname) && fs.createReadStream(pathname).pipe(zlib.createGzip()).pipe(resp)
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
