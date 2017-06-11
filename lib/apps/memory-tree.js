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

        if (middleware.onRoute(req, resp, pathname, conf, memory) === false) {
            return
        }
        if (_.isPlainObject(data)) {
            middleware.onDirectory(req, resp, pathname, conf, memory)
            let html = ['../'].concat(_.keys(data))
                .map(name => '<a href="' + url.resolve(base, name) + '">' + name + '</a>')
                .join('</li><li>')
            handleSuccess(resp, 'html').end('<meta charset="utf-8"/> <ul><li>' + html + '</li></ul>')
        } else if (data) {
            if (isText(pathname)) {
                data = middleware.onText(req, resp, pathname, conf, memory, data)
            }
            handleSuccess(resp, pathname).end(data)
        } else {
            handleNotFound(resp, pathname)
        }
    }

    const memoryConfig = conf => ({
        onSet: middleware.onSet(),
        onGet: middleware.onGet(),
        buildWatcher: middleware.buildWatcher,
        buildFilter: middleware.buildFilter,
        outputFilter: middleware.outputFilter,
        outputRename: middleware.outputRename
    })
    return (req, resp, next, conf) => {
        const location = url.parse(decodeURIComponent(req.url))
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
