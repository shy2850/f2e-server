const url = require('url')
const _ = require('lodash')
const mime = require('mime')
const MemoryTree = require('memory-tree')
const {
    // handleError,
    handleSuccess,
    handleNotFound
} = require('../util/resp')

const SERVER_SENT_SCRIPT = `<script>
    new EventSource('/server-sent-bit').onmessage = function (e) {
        e.data === 'true' && location.reload()
    }
</script>`

module.exports = (function () {
    let memory
    let update

    const serverSent = (req, resp) => {
        resp.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        })
        let interval = setInterval(() => {
            resp.write(`data:${update}\n\n`)
            update = false
        }, 500)
        req.connection.addListener('close', () => {
            resp.end()
            clearInterval(interval)
        }, false)
    }
    const exec = (req, resp, pathname, conf) => {
        const base = pathname + '/'
        const data = memory.get(pathname)
        if (_.isPlainObject(data)) {
            let html = ['../'].concat(_.keys(data))
                .map(name => '<a href="' + url.resolve(base, name) + '">' + name + '</a>')
                .join('</li><li>')
            handleSuccess(resp, 'html').end('<meta charset="utf-8"/> <ul><li>' + html + '</li></ul>' + SERVER_SENT_SCRIPT)
        } else if (data) {
            if (/html/.test(mime.lookup(pathname))) {
                handleSuccess(resp, pathname).end(data.toString() + SERVER_SENT_SCRIPT)
            } else {
                handleSuccess(resp, pathname).end(data)
            }
        } else if (pathname === '/server-sent-bit') {
            serverSent(req, resp)
        } else {
            handleNotFound(resp, pathname)
        }
    }

    const memoryConfig = {
        onSet: (pathname, data) => data,
        onGet: (pathname, data) => data,
        buildWatcher: (eventType, pathname) => {
            update = true
        },
        buildFilter: (pathname, data) => !/node_modules|([/\\]|^)\./.test(pathname),
        outputFilter: (pathname, data) => !/node_modules|([/\\]|^)\./.test(pathname),
        outputRename: (pathname, data) => pathname
    }
    return (req, resp, next, conf) => {
        const location = url.parse(decodeURIComponent(req.url))
        const pathname = location.pathname.replace(/[/\\]+$/, '')
        if (memory) {
            exec(req, resp, pathname, conf)
        } else {
            memory = MemoryTree(memoryConfig)
            memory.build(conf.root, {watch: 1})
                .then(() => exec(req, resp, pathname, conf))
        }
    }
})()
