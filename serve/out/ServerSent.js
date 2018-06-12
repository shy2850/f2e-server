module.exports = (fn, conf = {
    interval: 1000
}) => (req, resp) => {
    resp.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    })

    const loop = function loop () {
        const res = fn(req, resp, conf)
        if (res) {
            resp.write(`data:${JSON.stringify(res)}\n\n`)
        }
        setTimeout(loop, conf.interval || 1000)
    }

    req.connection.addListener('close', () => {
        resp.end()
    }, false)

    if (conf.interval !== 0) {
        loop()
    }
    return false
}
