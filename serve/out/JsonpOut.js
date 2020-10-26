// @ts-check
const zlib = require('zlib')
/**
 * @type {import('../index').ExecOut}
 */
const provider = (fn, conf = {}) => (req, resp) => {
    const { renderHeaders = (h => h) } = conf
    const { callback = 'callback' } = req['data']
    let out = (data) => resp.end(`${callback}(${JSON.stringify(data)})`)
    let header = renderHeaders({
        'Content-Type': 'text/javascript; charset=utf-8'
    }, req)
    if (conf.gzip) {
        header['Content-Encoding'] = 'gzip'
        out = (data) => resp.end(zlib.gzipSync(`${callback}(${JSON.stringify(data)})`))
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
