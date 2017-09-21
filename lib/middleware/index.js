const Build = require('./build')

let middlewares = [
    require('./include'),
    require('./less'),
    require('./babel'),
    require('./ServerSent')
]

const mod = (conf) => {
    let allConfig = {
        onDirectory: [].concat(conf.onDirectory || []),
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
                console.error(`!Error: middleware required! \n\t npm i ${middlewareName} --save-dev \n`)
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

    return {
        onRoute: (pathname, req, resp, memory) => {
            for (let i = 0; i < allConfig.onRoute.length; i++) {
                // onRoute 返回 false 停止继续
                let res = allConfig.onRoute[i](pathname, req, resp, memory)
                if (typeof res !== 'undefined') {
                    return res
                }
            }
        },
        onDirectory: (pathname, items, req, resp, memory) => {
            allConfig.onDirectory.map(item => item(pathname, items, req, resp, memory))
        },
        buildWatcher: (eventType, pathname, build) => {
            allConfig.buildWatcher.map(item => item(eventType, pathname, build))
        },
        onSet: (pathname, data, store) => {
            for (let i = 0; i < allConfig.onSet.length; i++) {
                data = allConfig.onSet[i](pathname, data, store) || data
            }
            return data
        },
        onGet: (pathname, data, store) => {
            for (let i = 0; i < allConfig.onGet.length; i++) {
                data = allConfig.onGet[i](pathname, data, store) || data
            }
            return data
        },
        onText: (pathname, data, req, resp, memory) => {
            for (let i = 0; i < allConfig.onText.length; i++) {
                let allow = allConfig.onText[i](pathname, data, req, resp, memory)
                if (data === false) {
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
