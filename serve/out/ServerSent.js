// @ts-check

/**
 * @type {import('../index').ExecOut}
 */
const provider = (fn, conf = {
    interval: 1000
}) => (req, resp) => {
    const { renderHeaders = (h => h) } = conf
    resp.writeHead(200, renderHeaders({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    }, req))

    let interval1
    let interval2

    const heartBeat = function heartBeat () {
        if (resp.writable && !resp.finished) {
            resp.write(`data:1\n\n`)
            interval1 = setTimeout(heartBeat, 100000)
        }
    }

    const loop = async function loop () {
        try {
            const res = await Promise.resolve(fn(req, resp, conf))
            if (res && resp.writable && !resp.finished) {
                resp.write(`data:${JSON.stringify(res)}\n\n`)
            }
        } catch (e) {
            console.log(e)
        }
        if (conf.interval) {
            interval2 = setTimeout(loop, conf.interval)
        } else {
            heartBeat()
        }
    }

    req.socket.addListener('close', () => {
        clearTimeout(interval1)
        clearTimeout(interval2)
        resp.end()
    })
    loop()
    return false
}

module.exports = provider
