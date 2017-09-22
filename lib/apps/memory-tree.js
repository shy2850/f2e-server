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

module.exports = (function () {
    let memory
    let middleware
    let RespUtil

    const exec = (req, resp, pathname, conf) => {
        pathname = decodeURIComponent(pathname)
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
    return (req, resp, next, conf) => {
        const location = url.parse(req.url)
        const pathname = (location.pathname.match(/[^/\\]+/g) || []).join('/')
        if (memory) {
            let reqBody = ''
            req.on('data', d => {
                reqBody += d
            }).on('end', () => {
                if (req.method.toUpperCase() === 'POST') {
                    req.post = querystring.parse(decodeURIComponent(reqBody))
                }
                req.data = querystring.parse(decodeURIComponent(location.query))
                exec(req, resp, pathname, conf)
            })
        } else {
            RespUtil = Resp(conf)
            middleware = Middleware(conf)
            memory = MemoryTree(memoryConfig(conf))
            memory.input(conf.root, {watch: conf.livereload})
                .then(() => exec(req, resp, pathname, conf))
        }
    }
})()
