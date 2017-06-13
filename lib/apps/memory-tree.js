const url = require('url')
const _ = require('lodash')
const mime = require('mime')
const MemoryTree = require('memory-tree')
const Middleware = require('../middleware/index')
const Resp = require('../util/resp')

const isText = pathname => !!mime.charsets.lookup(mime.lookup(pathname), false)

module.exports = (function () {
    let memory
    let middleware
    let RespUtil

    const exec = (req, resp, pathname, conf) => {
        const base = pathname + '/'
        const {
            // handleError,
            handleSuccess,
            handleNotFound
        } = RespUtil
        let data = memory.get(pathname)

        if (middleware.onRoute(pathname, req, resp, memory) === false) {
            return
        }
        if (_.isPlainObject(data)) {
            let items = ['../'].concat(_.keys(data)).map(name => ({
                name,
                href: url.resolve(base, name)
            }))
            middleware.onDirectory(pathname, items, req, resp, memory)
            handleSuccess(req, resp, 'html', '<meta charset="utf-8"/> <ul><li>' +
                items.map(({name, href}) => `<a href="${href}">${name}</a>`).join('</li><li>') +
            '</li></ul>')
        } else if (data) {
            if (isText(pathname)) {
                data = middleware.onText(pathname, data, req, resp, memory)
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
        buildFilter: conf.buildFilter || middleware.buildFilter
    })
    return (req, resp, next, conf) => {
        const location = url.parse(req.url)
        const pathname = location.pathname.replace(/[/\\]+$/, '')
        if (memory) {
            exec(req, resp, pathname, conf)
        } else {
            RespUtil = Resp(conf)
            middleware = Middleware(conf)
            memory = MemoryTree(memoryConfig(conf))
            memory.build(conf.root, {watch: 1})
                .then(() => exec(req, resp, pathname, conf))
        }
    }
})()
