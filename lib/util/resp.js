const mime = require('mime')
const ETag = require('etag')
const zlib = require('zlib')
const pkg = require('../../package.json')
const isText = pathname => !!mime.charsets.lookup(mime.lookup(pathname), false)

const version = `${pkg.name} ${pkg.version}`

const handleRange = (range, { req, resp, pathname, data, newTag }, conf) => {
    const size = conf.range_size || 1024 * 1024
    let [start, end] = range.replace(/[^\-\d]+/g, '').split('-')
    start = start | 0
    end = (end | 0) || (start + size)
    const d = data.slice(start, end)
    end = Math.min(end, start + d.length)
    resp.writeHead(206, {
        'Content-Type': mime.lookup(pathname),
        'X-Powered-By': version,
        'Accept-Ranges': 'bytes',
        'Content-Length': d.length,
        'Content-Range': `bytes ${start}-${end - 1}/${data.length}`,
        'ETag': newTag
    })
    resp.end(d)
}

module.exports = conf => {
    const { gzip } = conf || {}

    return {
        handleError: (resp, error) => {
            resp.writeHead(500, {
                'Content-Type': 'text/html; charset=utf-8',
                'X-Powered-By': version
            })
            resp.end(JSON.stringify(error))
            return resp
        },
        handleSuccess: (req, resp, pathname, data) => {
            const tag = req.headers['if-none-match']
            const newTag = data && ETag(data)
            const txt = isText(pathname)
            if (tag && data && tag === newTag) {
                resp.writeHead(304, 'Not Modified')
                resp.end()
            } if (req.headers['range'] && data instanceof Buffer) {
                handleRange(req.headers['range'], { req, resp, pathname, data, newTag }, conf)
            } else {
                let header = {
                    'Content-Type': mime.lookup(pathname) + '; charset=utf-8',
                    'Content-Encoding': gzip && txt ? 'gzip' : 'utf-8',
                    'X-Powered-By': version
                }
                newTag && (header['ETag'] = newTag)
                resp.writeHead(200, header)
                if (data) {
                    resp.end(gzip && txt ? zlib.gzipSync(data.toString()) : data)
                } else {
                    return resp
                }
            }
        },
        handleNotFound: (resp, pathname) => {
            resp.writeHead(404, {
                'Content-Type': 'text/html; charset=utf-8',
                'X-Powered-By': version
            })
            resp.end('<meta charset="utf-8"/>' +
                '<h2 style="text-align: center"> 404: <small>"' + pathname + '"</small>  is gone!</h2>')
            return resp
        }
    }
}
