// @ts-check
const zlib = require('zlib')
/**
 * @type {import('../index').ExecOut}
 */
const provider = (fn, conf = {}) => (req, resp) => {
    const { renderHeaders = (h => h) } = conf
    let out = data => resp.end(JSON.stringify(data))
    let header = renderHeaders({
        'Content-Type': 'application/json; charset=utf-8'
    }, req)
    if (conf.gzip) {
        header['Content-Encoding'] = 'gzip'
        out = data => resp.end(zlib.gzipSync(JSON.stringify(data)))
    }
    resp.writeHead(200, header)
    Promise.resolve(fn(req, resp, conf)).then(out).catch(err => {
        console.log(err)
        resp.writeHead(500, header)
        out({ error: err.toString() })
    })
    return false
}
module.exports = provider
