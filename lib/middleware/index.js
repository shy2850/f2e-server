const ServerSent = require('./ServerSent')
let middlewares = [ServerSent]
const mod = (conf) => {
    let onRoute = []
    let onDirectory = []
    let buildWatcher = []
    let onSet = []
    let onGet = []
    let onText = []
    let outputRename = []

    middlewares.map(Middleware => {
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
        if (middle.outputRename) {
            outputRename.push(middle.outputRename)
        }
    })

    return {
        onRoute: (req, resp, pathname, conf, memory) => {
            for (let i = 0; i < onRoute.length; i++) {
                // onRoute 返回 false 停止继续
                if (onRoute[i](req, resp, pathname, conf, memory) === false) {
                    return false
                }
            }
        },
        onDirectory: (req, resp, pathname, conf, memory) => {
            onDirectory.map(item => item(req, resp, pathname, conf, memory))
        },
        buildWatcher: (req, resp, pathname, conf, memory) => {
            buildWatcher.map(item => item(req, resp, pathname, conf, memory))
        },
        onSet: (req, resp, pathname, conf, memory) => (pathname, data) => {
            for (let i = 0; i < onSet.length; i++) {
                data = onSet[i](req, resp, pathname, conf, memory, data) || data
            }
            return data
        },
        onGet: (req, resp, pathname, conf, memory) => (pathname, data) => {
            for (let i = 0; i < onGet.length; i++) {
                data = onGet[i](req, resp, pathname, conf, memory, data) || data
            }
            return data
        },
        onText: (req, resp, pathname, conf, memory, text) => {
            for (let i = 0; i < onText.length; i++) {
                text = onText[i](req, resp, pathname, conf, memory, text) || text
            }
            return text
        },
        buildFilter: (pathname, data) => !/node_modules|([\\/]|^)\./.test(pathname),
        outputFilter: (pathname, data) => !/node_modules|([\\/]|^)\./.test(pathname),
        outputRename: (req, resp, pathname, conf, memory, text) => {
            for (let i = 0; i < onText.length; i++) {
                pathname = onText[i](req, resp, pathname, conf, memory) || pathname
            }
            return pathname
        }
    }
}

mod.register = middle => middlewares.push(middle)

module.exports = mod
