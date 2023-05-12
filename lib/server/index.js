// @ts-check
const PORT = require('../util/PORT')
const IP = require('../util/IP')
const { renderConf, setConfig, getConfig } = require('../conf')
const os = require('os')
const H = {
    http: require('http'),
    https: require('https')
}
const { spawn } = require('child_process')
/**
 * @param {import("http") | import("https")} h
 * @param {string} base
 * @returns {(url: string) => Promise}
 */
const renderPromise = (h, base) => (url) => new Promise((resolve, reject) => h.get(base + url, resolve).on('error', reject))

/**
 * @param {import('../../').F2EConfig} conf
 * @param {import('http').Server} server
 */
const doInit = (conf, server) => {
    const {port = 80, host = IP, open = false, init_urls = [''], onServerCreate} = conf
    const protocal = port === 443 ? 'https' : 'http'
    const base = protocal + '://' + host + ':' + port
    const toPromise = renderPromise(H[protocal], base)
    console.log('waiting for start ...')
    Promise.all(init_urls.map(toPromise)).then(function () {
        console.log(`server start on ${base}`)
        open && spawn(os.type().match(/Windows/) ? 'explorer' : 'open', [base])
        onServerCreate && onServerCreate(server, conf)
    }).catch(err => console.log(err))
}

/**
 * @param {import('../../').F2EConfig} conf
 * @returns
 */
const createServer = (conf) => {
    const { port, ssl_options = {} } = conf
    let server
    if (port === 443) {
        server = H.https.createServer(ssl_options, requestListener).listen(port)
    } else {
        server = H.http.createServer(requestListener).listen(port)
    }
    return server
}

const map_app = new Map()
const initing = new Set()
// 根据host和port寻找服务
const requestListener = async function (req, resp) {
    let [hostname, port = '80'] = (req.headers.host + '').split(':')
    if (req.client && req.client.ssl) {
        port = '443'
    }
    const host1 = `${hostname}:${port}`
    const host2 = `:${port}`

    const _app = map_app.get(host1) || map_app.get(host2)
    if (_app) {
        _app(req, resp)
        return
    }

    const conf = getConfig(host1) || getConfig(host2)
    const { handleError, handleSuccess } = require('../util/resp')(conf || {})
    if (!conf) {
        handleError(resp, Error('host not found!'), req)
        return
    }
    if (!conf.app || typeof conf.app === 'string') {
        handleError(resp, Error('wrong config of app!'), req)
        return
    }
    if (initing.has(host1) || initing.has(host2)) {
        handleSuccess(req, resp, 'index.html', '服务器加载中。。。稍后刷新页面')
        return
    }
    initing.add(host1)
    initing.add(host2)
    const app = await conf.app(conf)
    initing.delete(host1)
    initing.delete(host2)
    map_app.set(`${conf.host || ''}:${conf.port}`, app)
    app(req, resp)
}

/**
 * @type {Map<number, import('http').Server>}
 */
const map_server = new Map()

/**
 * 入口函数 处理配置项
 * @param {import('../../index').F2EConfig} _conf
 */
const entry = async (_conf) => {
    const conf = renderConf(_conf)
    if (conf.host) {
        conf.port = conf.port || 80
        setConfig(`${conf.host}:${conf.port}`, conf)
        // 如果端口已经开启服务，仅注册config
        const server = map_server.get(conf.port)
        if (server) {
            doInit(conf, server)
            return server
        }
    } else {
        setConfig(`:${conf.port}`, conf)
    }
    if (!conf.port) {
        conf.port = await PORT()
        setConfig(`:${conf.port}`, conf)
    }
    const server = createServer(conf)
    map_server.set(conf.port, server)
    doInit(conf, server)
    return server
}

module.exports = entry
