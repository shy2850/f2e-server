const url = require('url')
const _ = require('lodash')
const mime = require('mime')
const querystring = require('querystring')
const _MemoryTree = require('memory-tree')
const MemoryTree = _MemoryTree.default
const Middleware = require('../middleware/index')
const Resp = require('../util/resp')
const pkg = require('../../package.json')
const isText = pathname => !!mime.charsets.lookup(mime.lookup(pathname), false)

const version = `${pkg.name} ${pkg.version}`
const decode = str => {
    try {
        return decodeURIComponent(str)
    } catch (e) {
        return str
    }
}

module.exports = conf => {
    let memory
    let middleware
    let RespUtil

    const exec = async (req, resp, pathname, conf) => {
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
        let data = await memory.store.load(pathname)
        let base = pathname ? ('/' + pathname + '/') : '/'
        if (_.isPlainObject(data)) {
            let items = [{
                name: '../',
                href: base.replace(/[^\\/]+\/$/, '')
            }].concat(_.keys(data).map(name => ({
                name,
                href: base + name
            })))
            middleware.onDirectory(pathname, items, req, resp, memory.store)
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
                data = middleware.onText(pathname, data, req, resp, memory.store)
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
        root: conf.root,
        watch: conf.watch || conf.livereload,
        onSet: middleware.onSet,
        onGet: middleware.onGet,
        buildWatcher: middleware.buildWatcher,
        buildFilter: middleware.buildFilter
    })
    return (req, resp, next) => {
        const location = url.parse(req.url)
        let pathname = (location.pathname.match(/[^/\\]+/g) || []).join('/')
        pathname = decode(pathname)
        if (memory) {
            req.data = querystring.parse(decode(location.query))
            if (conf.beforeRoute && conf.beforeRoute(pathname, req, resp, conf) === false) {
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
                        req.post = {}
                        try {
                            req.post = querystring.parse(decode(req.body || '')) || {}
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    exec(req, resp, pathname, conf)
                })
            }
        } else {
            RespUtil = Resp(conf)
            middleware = Middleware(conf)
            memory = MemoryTree(memoryConfig(conf))
            memory.input('')
                .then(() => exec(req, resp, pathname, conf))
        }
    }
}
