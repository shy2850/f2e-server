const mime = require('mime')
const waitUtil = require('../util/wait-util')

const SERVER_SENT_SCRIPT = `<script>
    if(window.EventSource) {
        new EventSource('/server-sent-bit').onmessage = function (e) {
            e.data === 'true' && location.reload()
        }
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
    let responseSet = new Set([])
    const serverSent = (req, resp) => {
        resp.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        })
        responseSet.add(resp)
        req.connection.addListener('close', () => {
            responseSet.delete(resp)
            resp.end()
        }, false)
    }

    let heartBreakTimeout
    const send = function heartBreak (data) {
        for (let res of responseSet) {
            res.write(`data:${data}\n\n`)
        }
        clearTimeout(heartBreakTimeout)
        heartBreakTimeout = setTimeout(function () {
            // keep SSE-connection by sending message per 100s
            heartBreak(false)
        }, 1000 * 100)
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
        buildWatcher: (pathname, eventType, build, store) => {
            if (buildFilter(pathname)) {
                waitUtil(() => !store.isBuilding()).then(() => send(true)).catch(e => {
                    console.trace(e)
                })
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
