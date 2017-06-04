const fs = require('fs')
const url = require('url')
const mime = require('mime')
const path = require('path')
const getConfig = require('../conf/get')

const app = (req, resp) => {
    const parseResult = url.parse(req.url)
    let { pathname } = parseResult

    // 获取 host & port
    let [hostname, port = 80] = req.headers.host.split(':')
    if (req.client.ssl) {
        port = 443
    }

    // 获取 config
    const conf = getConfig(hostname, port)
    const filePathname = path.join(conf.root, pathname)

    fs.stat(filePathname, (error, stats) => {
        if (error) {
            resp.writeHead(500, {
                'Content-Type': 'text/html'
            })
            resp.end(JSON.stringify(error))
        }

        if (stats && stats.isFile()) {
            resp.writeHead(200, {
                'Content-Type': mime.lookup(pathname) || 'text/html'
            })
            fs.createReadStream(filePathname).pipe(resp)
        } else {
            resp.writeHead(404, {
                'Content-Type': 'text/html'
            })
            resp.end('404')
        }
    })
}

module.exports = app
