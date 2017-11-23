module.exports = (fn, conf = {}) => (req, resp) => {
    resp.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    })
    let interval = setInterval(() => {
        const res = fn(req, resp)
        resp.write(`data:${JSON.stringify(res)}\n\n`)
    }, 1000)
    req.connection.addListener('close', () => {
        resp.end()
        clearInterval(interval)
    }, false)
    return false
}
