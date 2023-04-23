// @ts-check
const { URL } = require('url')
const fs = require('fs')
const path = require('path')
const Resp = require('../util/resp')
const { pathname_fixer, decode, queryparam } = require('../util/misc')

/**
 *
 * @param {import('../../index').F2EConfig} conf
 * @returns
 */
const render = conf => {
    const { root, __withlog__, range_size, beforeRoute, buildFilter } = conf
    const {
        handleSuccess,
        handleNotFound,
        handleDirectory
    } = Resp(conf)

    /**
     *
     * @param {import('http').IncomingMessage} req
     * @param {import('http').ServerResponse} resp
     * @returns
     */
    const fn = (req, resp) => {
        const location = new URL('http://127.0.0.1' + req.url)
        let pathname = pathname_fixer(decode(location.pathname))
        req['data'] = queryparam(location.searchParams)

        if (beforeRoute) {
            let routeResult = beforeRoute(pathname, req, resp, conf)
            if (routeResult === false) {
                return
            } else {
                pathname = routeResult || pathname
            }
        }

        if (!buildFilter(pathname)) {
            handleNotFound(req, resp, pathname)
        }

        let pathname_real = path.join(root, pathname)
        fs.stat(pathname_real, (error, stats) => {
            if (__withlog__) {
                console.log(`${new Date().toLocaleString()}: ${pathname}`, error || '')
            }

            if (stats && stats.isFile()) {
                if (stats.size > range_size) {
                    handleSuccess(req, resp, pathname, stats)
                } else {
                    handleSuccess(req, resp, pathname, fs.readFileSync(pathname_real))
                }
            } else if (stats && stats.isDirectory()) {
                const data = handleDirectory(req, resp, pathname, fs.readdirSync(pathname_real).filter(buildFilter).reduce((m, n) => {
                    return Object.assign(m, {[n]: 1})
                }, {}))
                if (data) {
                    handleSuccess(req, resp, pathname, data)
                }
            } else {
                handleNotFound(req, resp, pathname)
            }
        })
    }
    return fn
}

module.exports = render
