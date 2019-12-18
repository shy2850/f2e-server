// @ts-check
const url = require('url')
const _ = require('lodash')
/** @type {any} */
const mime = require('mime')
const querystring = require('querystring')
const MemoryTree = require('memory-tree')['default']
const Middleware = require('../../middleware/index')
const Resp = require('../../util/resp')
const isText = pathname => !!mime.charsets.lookup(mime.lookup(pathname), false)

const decode = str => {
    try {
        return decodeURIComponent(str)
    } catch (e) {
        return str
    }
}
const queryparam = (str = '') => querystring.parse(str.replace(/\+/g, '%2B'))
const pathname_fixer = (str = '') => (str.match(/[^/\\]+/g) || []).join('/')

module.exports = conf => {
    let memory
    let middleware
    /** @type { import('../../util/resp').RespUtil } */
    let RespUtil

    const exec = async (req, resp, pathname) => {
        const routeResult = middleware.onRoute(pathname, req, resp, memory.store)
        if (routeResult === false) {
            return
        } else {
            pathname = routeResult || pathname
        }
        pathname = pathname_fixer(pathname)
        const {
            handleSuccess,
            handleNotFound,
            handleDirectory,
        } = RespUtil
        let data = await memory.store.load(pathname)
        if (_.isPlainObject(data)) {
            data = handleDirectory(req, resp, pathname, data)
            if (data === false) { return }
            data = middleware.onText(pathname, data, req, resp, memory.store)
            if (data === false) { return }
            handleSuccess(req, resp, 'html', data)
        } else if (data) {
            if (isText(pathname)) {
                data = middleware.onText(pathname, data, req, resp, memory.store)
                if (data === false) {
                    return
                }
            }
            handleSuccess(req, resp, pathname, data)
        } else {
            handleNotFound(req, resp, pathname)
        }
    }

    const memoryConfig = conf => ({
        root: conf.root,
        watch: conf.watch || conf.livereload,
        beforeRoute: middleware.beforeRoute,
        onSet: middleware.onSet,
        onGet: middleware.onGet,
        buildWatcher: middleware.buildWatcher,
        buildFilter: middleware.buildFilter
    })
    return (req, resp, next) => {
        const location = url.parse(req.url)
        let pathname = pathname_fixer(decode(location.pathname))
        if (memory) {
            req.data = queryparam(decode(location.query))
            let pathnameTemp = conf.beforeRoute ? conf.beforeRoute(pathname, req, resp, conf) : pathname
            if (pathnameTemp === false) {
                return
            } else if (typeof pathnameTemp === 'string') {
                pathname = pathnameTemp
            }
            if (req.method.toUpperCase() === 'GET') {
                exec(req, resp, pathname)
            } else {
                let chunks = []
                req.on('data', chunk => {
                    chunks.push(chunk)
                }).on('end', () => {
                    req.rawBody = chunks
                    req.body = Buffer.concat(chunks).toString('utf-8')
                    const defaultType = 'application/x-www-form-urlencoded'
                    const type = (req.headers && req.headers['content-type']) || defaultType
                    try {
                        switch (type) {
                        case mime.lookup('.json'):
                            req.body = JSON.parse(req.body)
                            break
                        default:
                            req.post = {}
                            req.post = queryparam(decode(req.body || '')) || {}
                            break
                        }
                    } catch (e) {
                        console.error(e)
                    }
                    exec(req, resp, pathname)
                })
            }
        } else {
            RespUtil = Resp(conf)
            middleware = Middleware(conf)
            memory = MemoryTree(memoryConfig(conf))
            memory.input('')
                .then(() => exec(req, resp, pathname))
        }
    }
}
