// @ts-check
const mime = require('mime')

/**
 * @type {import('../../index').MiddlewareCreater}
 */
module.exports = (conf) => {
    const {
        renderHeaders = (h => h),
        livereload
    } = conf

    /**
     * @type {import('../../index').LiveReloadConfig}
     */
    let options
    if (!livereload) {
        return
    } else {
        options = Object.assign({
            prefix: 'server-sent-bit',
            publicPath: '',
            heartBeatTimeout: 100000
        }, livereload === true ? {} : livereload)
    }
    const SERVER_SENT_SCRIPT = `<script>
    if(window.EventSource) {
        new EventSource('${options.publicPath}/${options.prefix}').onmessage = function (e) {
            e.data === 'true' && location.reload()
        }
    }
</script>`.replace(/[\r\n\s]+/g, ' ')
    /**
     * @type {Set<import('http').ServerResponse>}
     */
    let responseSet = new Set([])
    const serverSent = (req, resp) => {
        resp.writeHead(200, renderHeaders({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }, req))
        responseSet.add(resp)
        req.connection.addListener('close', () => {
            responseSet.delete(resp)
            resp.end()
        }, false)
    }

    let heartBeatTimeout
    const send = function heartBeat (data) {
        for (let res of responseSet) {
            res.write(`data:${data}\n\n`)
        }
        clearTimeout(heartBeatTimeout)
        heartBeatTimeout = setTimeout(function () {
            // keep SSE-connection by sending message per 100s
            heartBeat(false)
        }, options.heartBeatTimeout)
    }

    let store
    return {
        onRoute: (pathname, req, resp, memory) => {
            if (pathname === options.prefix) {
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
            const type = mime.getType(pathname)
            if (
                type && /html/.test(type) &&
                !/XMLHttpRequest/i.test(req.headers['x-requested-with'] + '')
            ) {
                return (data && data.toString()) + SERVER_SENT_SCRIPT
            } else {
                return data
            }
        }
    }
}
