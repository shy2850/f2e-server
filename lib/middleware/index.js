const Build = require('./build')

let middlewares = [
    require('./include'),
    require('./less'),
    require('./babel'),
    require('./ServerSent')
]

const mod = (conf) => {
    let allConfig = {
        onRoute: [],
        onDirectory: [],
        buildWatcher: [],
        onSet: [],
        onGet: [],
        onText: [],
        buildFilter: [
            (pathname, data) => !/node_modules|([\\/]|^)\./.test(pathname)
        ],
        outputFilter: conf.outputFilter ? [conf.outputFilter] : []
    }
    const keys = Object.keys(allConfig)

    middlewares.concat(conf.middlewares || []).map(Middleware => {
        const middle = Middleware(conf)
        middle && keys.map(key => {
            if (middle[key]) {
                allConfig[key].push(middle[key])
            }
        })
    })

    // build 模块需要在最后，并且收集到所有outputFilter
    const build = Build(conf, /* outputFilter */ (pathname, data) => {
        for (let i = 0; i < allConfig.outputFilter.length; i++) {
            let allow = allConfig.outputFilter[i](pathname, data)
            if (allow === false) {
                return false
            }
        }
        return true
    })
    build && keys.map(key => {
        if (build[key]) {
            allConfig[key].push(build[key])
        }
    })

    return {
        onRoute: (pathname, req, resp, memory) => {
            for (let i = 0; i < allConfig.onRoute.length; i++) {
                // onRoute 返回 false 停止继续
                if (allConfig.onRoute[i](pathname, req, resp, memory) === false) {
                    return false
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
                data = allConfig.onText[i](pathname, data, req, resp, memory) || data
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
        }
    }
}

module.exports = mod
