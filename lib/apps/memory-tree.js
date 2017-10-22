const url = require('url')
const _ = require('lodash')
const mime = require('mime')
const querystring = require('querystring')
const MemoryTree = require('memory-tree')
const Middleware = require('../middleware/index')
const Resp = require('../util/resp')
const pkg = require('../../package.json')
const isText = pathname => !!mime.charsets.lookup(mime.lookup(pathname), false)

const version = `${pkg.name} ${pkg.version}`

module.exports = conf => {
    let memory
    let middleware
    let RespUtil

    const exec = (req, resp, pathname, conf) => {
        const routeResult = middleware.onRoute(pathname, req, resp, memory)
        if (routeResult === false) {
            return
        } else {
            pathname = routeResult || pathname
        }
        const {
            // handleError,
            handleSuccess,
            handleNotFound
        } = RespUtil
        let data = memory.get(pathname)
        let base = pathname ? ('/' + pathname + '/') : '/'
        if (_.isPlainObject(data)) {
            let items = [{
                name: '../',
                href: base.replace(/[^\\/]+\/$/, '')
            }].concat(_.keys(data).map(name => ({
                name,
                href: base + name
            })))
            middleware.onDirectory(pathname, items, req, resp, memory)
            handleSuccess(req, resp, 'html', '<meta charset="utf-8"/> <ul><li>' +
                items.map(({name, href}) => `<a href="${href}">${name}</a>`).join('</li><li>') +
            '</li></ul>')
        } else if (data) {
            if (isText(pathname)) {
                let header = {
                    'Content-Type': mime.lookup(pathname) + '; charset=utf-8',
                    'X-Powered-By': version
                }
                resp.writeHead(200, header)
                data = middleware.onText(pathname, data, req, resp, memory)
                if (data === false) {
                    return
                }
            }
            handleSuccess(req, resp, pathname, data)
        } else {
            handleNotFound(resp, pathname)
        }
    }

    const memoryConfig = conf => ({
        onSet: middleware.onSet,
        onGet: middleware.onGet,
        buildWatcher: middleware.buildWatcher,
        buildFilter: middleware.buildFilter
    })
    return (req, resp, next) => {
        const location = url.parse(req.url)
        let pathname = (location.pathname.match(/[^/\\]+/g) || []).join('/')
        pathname = decodeURIComponent(pathname)
        if (memory) {
            req.data = querystring.parse(decodeURIComponent(location.query))
            if (conf.beforeRoute && conf.beforeRoute(req, resp, pathname, conf) === false) {
                return
            }
            if (req.method.toUpperCase() === 'GET') {
                exec(req, resp, pathname, conf)
            } else {
                let chunks = []
                req.on('data', chunk => {
                    chunks.push(chunk)
                }).on('end', () => {
                    req.rawBody = chunks
                    req.body = Buffer.concat(chunks).toString('utf-8')
                    if (req.headers && req.headers['content-type'] === 'application/x-www-form-urlencoded') {
                        req.post = querystring.parse(decodeURIComponent(req.body)) || {}
                    }
                    exec(req, resp, pathname, conf)
                })
            }
        } else {
            RespUtil = Resp(conf)
            middleware = Middleware(conf)
            memory = MemoryTree(memoryConfig(conf))
            memory.input(conf.root, {watch: conf.livereload})
                .then(() => exec(req, resp, pathname, conf))
        }
    }
}
