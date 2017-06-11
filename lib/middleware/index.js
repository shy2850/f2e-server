let middlewares = [
    require('./less'),
    require('./babel'),
    require('./build'),
    require('./ServerSent')
]

const mod = (conf) => {
    let onRoute = []
    let onDirectory = []
    let buildWatcher = []
    let onSet = []
    let onGet = []
    let onText = []

    middlewares.concat(conf.middlewares || []).map(Middleware => {
        const middle = Middleware(conf)
        if (middle.onRoute) {
            onRoute.push(middle.onRoute)
        }
        if (middle.onDirectory) {
            onDirectory.push(middle.onDirectory)
        }
        if (middle.buildWatcher) {
            buildWatcher.push(middle.buildWatcher)
        }
        if (middle.onSet) {
            onSet.push(middle.onSet)
        }
        if (middle.onGet) {
            onGet.push(middle.onGet)
        }
        if (middle.onText) {
            onText.push(middle.onText)
        }
    })

    return {
        onRoute: (pathname, req, resp, memory) => {
            for (let i = 0; i < onRoute.length; i++) {
                // onRoute 返回 false 停止继续
                if (onRoute[i](pathname, req, resp, memory) === false) {
                    return false
                }
            }
        },
        onDirectory: (pathname, items, req, resp, memory) => {
            onDirectory.map(item => item(pathname, items, req, resp, memory))
        },
        buildWatcher: (eventType, pathname) => {
            buildWatcher.map(item => item(eventType, pathname))
        },
        onSet: (pathname, data, store) => {
            for (let i = 0; i < onSet.length; i++) {
                data = onSet[i](pathname, data, store) || data
            }
            return data
        },
        onGet: (pathname, data, store) => {
            for (let i = 0; i < onGet.length; i++) {
                data = onGet[i](pathname, data, store) || data
            }
            return data
        },
        onText: (pathname, data, req, resp, memory) => {
            for (let i = 0; i < onText.length; i++) {
                data = onText[i](pathname, data, req, resp, memory) || data
            }
            return data
        },
        buildFilter: (pathname, data) => !/node_modules|([\\/]|^)\./.test(pathname)
    }
}

mod.register = middle => middlewares.push(middle)

module.exports = mod
