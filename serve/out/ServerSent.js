module.exports = (fn, conf = {
    interval: 1000
}) => (req, resp) => {
    resp.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    })

    const heart_beat = function heart_beat() {
        if (resp.writable && !resp.finished) {
            resp.write(`data:1\n\n`)
            setTimeout(heart_beat, 100000)
        }
    }

    const loop = function loop () {
        const res = fn(req, resp, conf)
        if (res) {
            resp.write(`data:${JSON.stringify(res)}\n\n`)
        }
        if (conf.interval) {
            setTimeout(loop, conf.interval)
        } else {
            heart_beat()
        }
    }

    req.connection.addListener('close', () => {
        resp.end()
    }, false)
    loop()
    return false
}
