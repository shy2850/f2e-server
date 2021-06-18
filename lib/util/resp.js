// @ts-check
const mime = require('mime')
const fs = require('fs')
const path = require('path')
const ETag = require('etag')
const zlib = require('zlib')
const _ = require('lodash')
// @ts-ignore
const pkg = require('../../package.json')
const isText = pathname => {
    const type = mime.getType(pathname)
    return /\b(html?|txt|javascript|json)\b/.test(type)
}

const version = `${pkg.name} ${pkg.version}`
/**
 * @param {import('../../index').F2EConfig} conf
 */
const handleRange = (range, { req, resp, pathname, data, newTag }, conf) => {
    const renderHeaders = conf.renderHeaders || (h => h)
    const size = conf.range_size || 1024 * 1024
    let [start, end] = range.replace(/[^\-\d]+/g, '').split('-')
    start = start | 0
    end = (end | 0) || (start + size)
    const d = data.slice(start, end)
    end = Math.min(end, start + d.length)
    resp.writeHead(206, renderHeaders({
        'Content-Type': mime.getType(pathname),
        'X-Powered-By': version,
        'Accept-Ranges': 'bytes',
        'Content-Length': d.length,
        'Content-Range': `bytes ${start}-${end - 1}/${data.length}`,
        'ETag': newTag
    }, req))
    resp.end(d)
}

/**
 * @param {import('../../index').F2EConfig} conf
 */
module.exports = conf => {
    const { root, gzip, page_404, page_50x, page_dir } = conf || {}
    const renderHeaders = conf.renderHeaders || (h => h)
    const template_404 = typeof page_404 === 'string'
        ? (compile => (req, resp, param = {}) => compile(param))(_.template(fs.readFileSync(page_404).toString()))
        : page_404
    const template_50x = typeof page_50x === 'string'
        ? (compile => (req, resp, param = {}) => compile(param))(_.template(fs.readFileSync(page_50x).toString()))
        : page_50x
    const template_dir = typeof page_dir === 'string'
        ? (compile => (req, resp, param = {}) => compile(param))(_.template(fs.readFileSync(page_dir).toString()))
        : page_dir
    const authorization = conf.authorization && Buffer.from(conf.authorization).toString('base64')

    /**
     * @param {import('http').ServerResponse} resp
     * @param {Error} error
     */
    const handleError = (resp, error) => {
        resp.writeHead(500, renderHeaders({
            'Content-Type': 'text/html; charset=utf-8',
            'X-Powered-By': version
        }, null))
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
        } else if (req.headers['range'] && data instanceof Buffer) {
            handleRange(req.headers['range'], { req, resp, pathname, data, newTag }, conf)
        } else {
            let header = renderHeaders({
                'Content-Type': mime.getType(pathname) + '; charset=utf-8',
                'Content-Encoding': gzip && txt ? 'gzip' : 'utf-8',
                'X-Powered-By': version
            }, req)
            newTag && (header['ETag'] = newTag)
            resp.writeHead(200, header)
            resp.end(gzip && txt ? zlib.gzipSync(data.toString()) : data)
        }
    }

    /**
     * @param {import('http').IncomingMessage} req
     * @param {import('http').ServerResponse} resp
     * @param {string} pathname
     */
    const handleNotFound = (req, resp, pathname) => {
        resp.writeHead(404, renderHeaders({
            'Content-Type': 'text/html; charset=utf-8',
            'X-Powered-By': version
        }, req))
        resp.end(template_404(req, resp, { pathname }))
        return resp
    }

    /**
     * @param {import('http').IncomingMessage} req
     * @param {import('http').ServerResponse} resp
     * @param {string} pathname
     * @param {object} store
     * @returns {string | false}
     */
    const handleDirectory = (req, resp, pathname, store) => {
        const method = req.method.toUpperCase()
        if (method === 'GET') {
            return template_dir(req, resp, { pathname: pathname_fixer(pathname), dirname: pathname_dirname(pathname), store, conf })
        }
        const { headers = {} } = req
        if (!authorization || headers.authorization !== 'Basic ' + authorization) {
            resp.statusCode = 401
            resp.setHeader('WWW-Authenticate', 'Basic realm="example"')
            resp.end('Access denied')
            return false
        }
        let { file = '' } = req['data']
        file = file.replace(/\/+/g, '')
        if (!file) {
            resp.statusCode = 403
            resp.end('缺少参数')
            return false
        }
        const file_path = path.join(root, pathname + '/' + file)
        try {
            switch (method) {
            case 'DELETE':
                const stat = fs.statSync(file_path)
                stat.isFile() && fs.unlinkSync(file_path)
                stat.isDirectory() && fs.rmdirSync(file_path)
                delete store[file]
                break
            case 'PUT':
                fs.writeFileSync(file_path, Buffer.concat(req['rawBody']))
                break
            case 'POST':
                fs.mkdirSync(file_path)
                store[file] = {}
                break
            default:
            }
        } catch (e) {
            handleError(resp, e)
        }
        return false
    }
    return {
        handleError,
        handleSuccess,
        handleNotFound,
        handleDirectory
    }
}

const pathname_fixer = (str = '') => (str.match(/[^/\\]+/g) || []).join('/')
const pathname_dirname = (str = '') => (str.match(/[^/\\]+/g) || []).slice(0, -1).join('/')