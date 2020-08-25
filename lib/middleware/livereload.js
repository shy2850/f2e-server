// @ts-check
const mime = require('mime')

const SERVER_SENT_SCRIPT = `<script>
    if(window.EventSource) {
        new EventSource('/server-sent-bit').onmessage = function (e) {
            e.data === 'true' && location.reload()
        }
    }
</script>`.replace(/[\r\n\s]+/g, ' ')

/**
 * @type {import('../../index').MiddlewareCreater}
 */
module.exports = (conf) => {
    const {
        livereload
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

    let store
    return {
        onRoute: (pathname, req, resp, memory) => {
            if (pathname === 'server-sent-bit') {
                serverSent(req, resp)
                return false
            }
        },
        buildWatcher: (pathname, eventType, build, _store) => {
            if (!store) {
                store = _store
                let last_building = false
                store.onBuildingChange(function (building) {
                    if (last_building && !building) {
                        send(true)
                    }
                    last_building = building
                })
            }
        },
        onText: (pathname, data, req, resp, memory) => {
            if (
                /html/.test(mime.getType(pathname)) &&
                !/XMLHttpRequest/i.test(req.headers['x-requested-with'] + '')
            ) {
                return data.toString() + SERVER_SENT_SCRIPT
            }
        }
    }
}
