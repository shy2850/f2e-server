const mime = require('mime')
const pkg = require('../../package.json')

const version = `${pkg.name} ${pkg.version}`

module.exports = conf => {
    return {
        handleError: (resp, error) => {
            resp.writeHead(500, {
                'Content-Type': 'text/html; charset=utf-8',
                'X-Powered-By': version
            })
            resp.end(JSON.stringify(error))
            return resp
        },
        handleSuccess: (resp, pathname, data) => {
            resp.writeHead(200, {
                'Content-Type': (mime.lookup(pathname) || 'text/html') + '; charset=utf-8',
                'X-Powered-By': version
            })
            if (data) {
                resp.end(data)
            }
            return resp
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
