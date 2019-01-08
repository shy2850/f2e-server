module.exports = (fn, conf = {
    interval: 1000
}) => (req, resp) => {
    resp.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    })

    let interval1
    let interval2

    const heart_beat = function heart_beat() {
        if (resp.writable && !resp.finished) {
            resp.write(`data:1\n\n`)
            interval1 = setTimeout(heart_beat, 100000)
        }
    }

    const loop = function loop () {
        const res = fn(req, resp, conf)
        if (res && resp.writable && !resp.finished) {
            resp.write(`data:${JSON.stringify(res)}\n\n`)
        }
        if (conf.interval) {
            interval2 = setTimeout(loop, conf.interval)
        } else {
            heart_beat()
        }
    }

    req.connection.addListener('close', () => {
        clearTimeout(interval1)
        clearTimeout(interval2)
        resp.end()
    }, false)
    loop()
    return false
}
