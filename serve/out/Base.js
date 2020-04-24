// @ts-check

const zlib = require('zlib')
const mime = require('mime')

module.exports = (type = 'text/html') => {
    const mimeType = mime.getType(type) || type
    const isText = pathname => {
        const type = mime.getType(pathname)
        return /\b(html?|txt|javascript|json)\b/.test(type)
    }
    return (fn, conf = {}) => (req, resp) => {
        let out = data => resp.end(data)
        let header = {
            'Content-Type': mimeType + (isText ? '; charset=utf-8' : '')
        }
        if (conf.gzip && isText) {
            header['Content-Encoding'] = 'gzip'
            out = data => resp.end(zlib.gzipSync(data))
        }
        resp.writeHead(200, header)
        Promise.resolve(fn(req, resp, conf)).then(out).catch(err => {
            console.log(err)
            resp.writeHead(500, header)
            out(err.toString())
        })
        return false
    }
}
