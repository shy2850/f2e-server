const mime = require('mime')

const SERVER_SENT_SCRIPT = `<script>
    new EventSource('/server-sent-bit').onmessage = function (e) {
        e.data === 'true' && location.reload()
    }
</script>`.replace(/[\r\n\s]+/g, ' ')

module.exports = (conf) => {
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
    return conf['livereload'] !== false ? {
        onRoute: (pathname, req, resp, memory) => {
            if (pathname === '/server-sent-bit') {
                serverSent(req, resp)
                return false
            }
        },
        buildWatcher: (eventType, pathname) => {
            update = true
        },
        onText: (pathname, data) => {
            if (/html/.test(mime.lookup(pathname))) {
                return data.toString() + SERVER_SENT_SCRIPT
            }
        }
    } : {}
}
