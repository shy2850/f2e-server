// @ts-check
const fs = require('fs')
const path = require('path')
const Resp = require('../util/resp')

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
        let pathname = path.join(conf.root, location.pathname)
        req['data'] = location.searchParams
        /**
         * @type {any}
         */
        let store = {}
        if (conf.onRoute) {
            let routeResult = conf.onRoute(location.pathname, req, resp, store)
            if (routeResult === false) {
                return
            } else {
                pathname = routeResult ? path.join(conf.root, routeResult) : pathname
            }
        }
    
        fs.stat(pathname, (error, stats) => {
            if (conf.__withlog__) {
                console.log(`${new Date().toLocaleString()}: ${pathname}`)
            }

            if (stats && stats.isFile()) {
                if (stats.size > conf.range_size) {
                    handleSuccess(req, resp, location.pathname, stats)
                } else {
                    handleSuccess(req, resp, location.pathname, fs.readFileSync(pathname))
                }
            } else if (stats && stats.isDirectory()) {
                const data = handleDirectory(req, resp, location.pathname, fs.readdirSync(pathname).reduce((m, n) => {
                    return {...m, [n]: 1}
                }, {}))
                if (data) {
                    handleSuccess(req, resp, location.pathname, data)
                }
            } else {
                handleNotFound(req, resp, location.pathname)
            }
        })
    }
    return fn
}

module.exports = render