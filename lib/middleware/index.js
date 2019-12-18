const Build = require('./build')
const { isPlainObject } = require('lodash')

let middlewares = [
    require('./include'),
    require('./less'),
    require('./babel'),
    require('./setModuleId'),
    require('./livereload')
]

const mod = (conf) => {
    let allConfig = {
        beforeRoute: [].concat(conf.beforeRoute || []),
        onRoute: [].concat(conf.onRoute || []),
        buildWatcher: [].concat(conf.buildWatcher || []),
        onSet: [].concat(conf.onSet || []),
        onGet: [].concat(conf.onGet || []),
        onText: [].concat(conf.onText || []),
        buildFilter: [].concat(conf.buildFilter || []),
        outputFilter: [].concat(conf.outputFilter || [])
    }
    const keys = Object.keys(allConfig)

    middlewares.concat(conf.middlewares || []).map(Middleware => {
        let middle
        const {middleware} = Middleware
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

    /* eslint-disable promise/param-names */
    return {
        beforeRoute: (pathname, req, resp, memory) => {
            for (let i = 0; i < allConfig.beforeRoute.length; i++) {
                // beforeRoute 返回 false 停止继续
                let res = allConfig.beforeRoute[i](pathname, req, resp, memory)
                if (typeof res !== 'undefined') {
                    return res
                }
            }
        },
        onRoute: (pathname, req, resp, memory) => {
            for (let i = 0; i < allConfig.onRoute.length; i++) {
                // onRoute 返回 false 停止继续
                let res = allConfig.onRoute[i](pathname, req, resp, memory)
                if (typeof res !== 'undefined') {
                    return res
                }
            }
        },
        buildWatcher: (pathname, eventType, build, store) => {
            allConfig.buildWatcher.map(item => item(pathname, eventType, build, store))
        },
        onSet: (pathname, data, store) => new Promise(async function (resolve, regect) {
            let temp = { data, originPath: pathname, outputPath: pathname }
            for (let i = 0; i < allConfig.onSet.length; i++) {
                let res = await Promise.resolve(allConfig.onSet[i](pathname, temp.data, store))
                if (isPlainObject(res)) {
                    Object.assign(temp, res)
                } else if (res) {
                    temp.data = res
                }
            }
            resolve(temp)
        }),
        onGet: (pathname, data, store) => new Promise(async function (resolve, regect) {
            let temp = data
            for (let i = 0; i < allConfig.onGet.length; i++) {
                let res = await Promise.resolve(allConfig.onGet[i](pathname, temp || data, store))
                temp = res || temp
            }
            resolve(temp)
        }),
        onText: (pathname, data, req, resp, memory) => {
            for (let i = 0; i < allConfig.onText.length; i++) {
                let allow = allConfig.onText[i](pathname, data, req, resp, memory)
                if (allow === false) {
                    return false
                } else {
                    data = allow || data
                }
            }
            return data
        },
        buildFilter: (pathname, data) => {
            for (let i = 0; i < allConfig.buildFilter.length; i++) {
                let allow = allConfig.buildFilter[i](pathname, data)
                if (allow === false) {
                    return false
                }
            }
            return true
        },
        outputFilter: (pathname, data) => {
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
