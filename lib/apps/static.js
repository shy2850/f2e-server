// @ts-check
const fs = require('fs')
const path = require('path')
const Resp = require('../util/resp')

const decode = str => {
    try {
        return decodeURIComponent(str)
    } catch (e) {
        return str
    }
}
const pathname_fixer = (str = '') => (str.match(/[^/\\]+/g) || []).join('/')

/**
 * 
 * @param {import('../../index').F2EConfig} conf 
 * @returns 
 */
const render = conf => {

    const {
        handleSuccess,
        handleNotFound,
        handleDirectory,
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
        req['data'] = location.searchParams
        /**
         * @type {any}
         */
        let store = {}
        if (conf.onRoute) {
            let routeResult = conf.onRoute(pathname, req, resp, store)
            if (routeResult === false) {
                return
            } else {
                pathname = routeResult || pathname
            }
        }

        let pathname_real = path.join(conf.root, pathname)
        fs.stat(pathname_real, (error, stats) => {
            if (conf.__withlog__) {
                console.log(`${new Date().toLocaleString()}: ${pathname}`)
            }

            if (stats && stats.isFile()) {
                if (stats.size > conf.range_size) {
                    handleSuccess(req, resp, pathname, stats)
                } else {
                    handleSuccess(req, resp, pathname, fs.readFileSync(pathname_real))
                }
            } else if (stats && stats.isDirectory()) {
                const data = handleDirectory(req, resp, pathname, fs.readdirSync(pathname_real).reduce((m, n) => {
                    return {...m, [n]: 1}
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