const Build = require('./build')
const TryFiles = require('./try_files')
const { isPlainObject } = require('lodash')
var crypto = require('crypto')

/** @type {any[]} */
let middlewares = [
    require('./include'),
    require('./less'),
    require('./livereload'),
    require('./namehash')
]

/**
 *
 * @param {import('../../index').F2EConfig} conf
 *
 * @returns {Required<Omit<import('../../index').F2Events, 'onGet' | 'onSet'> & { onGet?: any, onSet: any }>}
 */
const mod = (conf) => {
    let allConfig = {
        beforeRoute: [].concat(conf.beforeRoute || []),
        onRoute: [].concat(conf.onRoute || []),
        buildWatcher: [].concat(conf.buildWatcher || []),
        onSet: [].concat(conf.onSet || []),
        onGet: [].concat(conf.onGet || []),
        onText: [].concat(conf.onText || []),
        buildFilter: [].concat(conf.buildFilter || []),
        watchFilter: [].concat(conf.watchFilter || []),
        outputFilter: [].concat(conf.outputFilter || [])
    }
    const keys = Object.keys(allConfig)

    middlewares
        .concat(conf.middlewares || [])
        .concat(TryFiles)
        .map((Middleware) => {
            let middle
            /** @type {any} */
            const { middleware } = Middleware
            if (typeof Middleware === 'function') {
                middle = Middleware(conf)
            } else if (middleware) {
                const middlewareName = `f2e-middle-${middleware}`
                try {
                    middle = require(middlewareName)(conf, Middleware)
                } catch (e) {
                    console.error(e)
                }
            }
            middle && keys.map(key => {
                if (middle[key]) {
                    if (typeof middle.setBefore === 'number') {
                        allConfig[key].splice(middle.setBefore, 0, middle[key])
                    } else {
                        allConfig[key].push(middle[key])
                    }
                }
            })
        })

    // build 模块需要在最后
    const build = Build(conf)
    build && keys.map(key => {
        if (build[key]) {
            allConfig[key].push(build[key])
        }
    })

    const ignore_events = conf['ignore_events']
    const ignores = new Set(ignore_events || ['add', 'addDir'])
    /** 有过改写路径的编译资源 */
    const input_output_map = new Map()
    return {
        beforeRoute: async (pathname, req, resp, conf) => {
            for (let i = 0; i < allConfig.beforeRoute.length; i++) {
                // beforeRoute 返回 false 停止继续
                let res = await Promise.resolve(allConfig.beforeRoute[i](pathname, req, resp, conf))
                if (typeof res !== 'undefined') {
                    return res
                }
            }
        },
        onRoute: async (pathname, req, resp, memory) => {
            for (let i = 0; i < allConfig.onRoute.length; i++) {
                // onRoute 返回 false 停止继续
                let res = await Promise.resolve(allConfig.onRoute[i](pathname, req, resp, memory))
                if (typeof res !== 'undefined') {
                    return res
                }
            }
        },
        buildWatcher: (pathname, eventType, build, store) => {
            if (conf.__withlog__ && !ignores.has(eventType)) {
                console.log(`${eventType}: ${pathname}`)
            }
            allConfig.buildWatcher.map(item => item(pathname, eventType, build, store))
        },
        onSet: async (pathname, data, store) => {
            /**
             * @type {import('../../index').SetResult}
             */
            let temp = { data, originPath: pathname, outputPath: pathname, end: false }
            if (conf.__ignores__.has(pathname)) {
                return temp
            }
            let t = 0
            if (conf.__withlog__) {
                t = Date.now()
            }
            for (let i = 0; i < allConfig.onSet.length; i++) {
                let res = await Promise.resolve(allConfig.onSet[i](temp.outputPath, temp.data, store))
                if (isPlainObject(res)) {
                    Object.assign(temp, res)
                } else if (res) {
                    temp.data = res
                }
                if (temp.end) {
                    break
                }
            }
            if (conf.__withlog__) {
                console.log(`compile: ${pathname} ${Date.now() - t}ms`)
            }
            if (conf.rename || temp.originPath !== temp.outputPath) {
                const hash = crypto.createHash('md5').update(temp.data).digest('hex')
                input_output_map.set(temp.originPath, {
                    output: conf.rename ? conf.rename(temp.outputPath) : temp.outputPath,
                    hash
                })
            }
            return temp
        },
        onGet: async (pathname, data, store) => {
            let temp = data
            for (let i = 0; i < allConfig.onGet.length; i++) {
                let res = await Promise.resolve(allConfig.onGet[i](pathname, temp || data, store, input_output_map))
                temp = res || temp
            }
            return temp
        },
        onText: async (pathname, data, req, resp, memory) => {
            for (let i = 0; i < allConfig.onText.length; i++) {
                let allow = await Promise.resolve(allConfig.onText[i](pathname, data, req, resp, memory))
                if (allow === false) {
                    return false
                } else {
                    data = allow || data
                }
            }
            return data
        },
        watchFilter: (pathname) => {
            for (let i = 0; i < allConfig.watchFilter.length; i++) {
                let allow = allConfig.watchFilter[i](pathname)
                if (allow === false) {
                    return false
                }
            }
            return true
        },
        buildFilter: (pathname) => {
            for (let i = 0; i < allConfig.buildFilter.length; i++) {
                let allow = allConfig.buildFilter[i](pathname)
                if (allow === false) {
                    return false
                }
            }
            return true
        },
        outputFilter: (pathname, data) => {
            if (conf.__ignores__.has(pathname)) {
                return false
            }
            for (let i = 0; i < allConfig.outputFilter.length; i++) {
                let allow = allConfig.outputFilter[i](pathname, data)
                if (allow === false) {
                    return false
                }
            }
            return true
        }
    }
}

module.exports = mod
