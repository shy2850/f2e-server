// @ts-check
/** @type {any} */
const mime = require('mime')
const fs = require('fs')
const ETag = require('etag')
const zlib = require('zlib')
const _ = require('lodash')
// @ts-ignore
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

/**
 * @param {import('../../index').F2EConfig} conf
 */
module.exports = conf => {
    const { gzip, page_404, page_50x, page_dir } = conf || {}
    const template_404 = typeof page_404 === 'string'
        ? (compile => (req, resp, param = {}) => compile(param))(_.template(fs.readFileSync(page_404).toString()))
        : page_404
    const template_50x = typeof page_50x === 'string'
        ? (compile => (req, resp, param = {}) => compile(param))(_.template(fs.readFileSync(page_50x).toString()))
        : page_50x
    const template_dir = typeof page_dir === 'string'
        ? (compile => (req, resp, param = {}) => compile(param))(_.template(fs.readFileSync(page_dir).toString()))
        : page_dir

    /**
     * @param {import('http').ServerResponse} resp
     * @param {Error} error
     */
    const handleError = (resp, error) => {
        resp.writeHead(500, {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Powered-By': version
        })
        resp.end(template_50x(null, resp, { error }))
        return resp
    }

    /**
     * @param {import('http').IncomingMessage} req
     * @param {import('http').ServerResponse} resp
     * @param {string} pathname
     * @param {Buffer|string} data
     */
    const handleSuccess = (req, resp, pathname, data) => {
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
    }

    /**
     * @param {import('http').IncomingMessage} req
     * @param {import('http').ServerResponse} resp
     * @param {string} pathname
     */
    const handleNotFound = (req, resp, pathname) => {
        resp.writeHead(404, {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Powered-By': version
        })
        resp.end(template_404(req, resp, { pathname }))
        return resp
    }

    /**
     * @param {import('http').IncomingMessage} req
     * @param {import('http').ServerResponse} resp
     * @param {string} pathname
     * @param {object} store
     * @returns {string}
     */
    const handleDirectory = (req, resp, pathname, store) => {
        return template_dir(req, resp, { pathname, store })
    }
    return {
        handleError,
        handleSuccess,
        handleNotFound,
        handleDirectory
    }
}
