const mime = require('mime')
const INTERVAL_TIME = 500

const SERVER_SENT_SCRIPT = `<script>
    new EventSource('/server-sent-bit').onmessage = function (e) {
        e.data === 'true' && location.reload()
    }
</script>`.replace(/[\r\n\s]+/g, ' ')

module.exports = (conf) => {
    const {
        livereload,
        buildFilter
    } = conf
    if (livereload === false) {
        return
    }
    let update
    let updateClearTimeout
    const serverSent = (req, resp) => {
        resp.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        })
        let interval = setInterval(() => {
            resp.write(`data:${update}\n\n`)
        }, INTERVAL_TIME)
        req.connection.addListener('close', () => {
            resp.end()
            clearInterval(interval)
        }, false)
    }
    return {
        onRoute: (pathname, req, resp, memory) => {
            if (pathname === 'server-sent-bit') {
                serverSent(req, resp)
                return false
            }
        },
        onDirectory: (pathname, items) => {
            items[0].name += SERVER_SENT_SCRIPT
        },
        buildWatcher: (eventType, pathname) => {
            if (buildFilter(pathname)) {
                update = true
                clearTimeout(updateClearTimeout)
                updateClearTimeout = setTimeout(e => {
                    update = false
                }, INTERVAL_TIME)
            }
        },
        onText: (pathname, data, req, resp, memory) => {
            if (
                /html/.test(mime.lookup(pathname)) &&
                !/XMLHttpRequest/i.test(req.headers['x-requested-with'])
            ) {
                return data.toString() + SERVER_SENT_SCRIPT
            }
        }
    }
}
