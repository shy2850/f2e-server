const zlib = require('zlib')
module.exports = (fn, conf = {}) => (req, resp) => {
    const { callback = 'callback' } = req.data
    let out = (data) => resp.end(`${callback}(${JSON.stringify(data)})`)
    let header = {
        'Content-Type': 'text/javascript; charset=utf-8'
    }
    if (conf.gzip) {
        header['Content-Encoding'] = 'gzip'
        out = (data) => resp.end(zlib.gzipSync(`${callback}(${JSON.stringify(data)})`))
    }
    resp.writeHead(200, header)
    const res = fn(req, resp)
    if (res instanceof Promise) {
        res.then(data => {
            out(data)
        }).catch(e => {
            out(e)
        })
    } else {
        out(res)
    }
    return false
}
