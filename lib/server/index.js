// @ts-check
const createServer = require('./createServer')
const PORT = require('../util/PORT')
const setConf = require('../conf/set')
const IP = require('../util/IP')
const HOSTS = require('../util/HOSTS')
const root = process.cwd()
const conf = require('../conf/conf')()
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
const explorer = (port = 80, host = IP, init_urls = ['']) => {
    const withStart = process.argv.includes('start')
    const protocal = port === 443 ? 'https' : 'http'
    const base = protocal + '://' + host + ':' + port
    const toPromise = renderPromise(H[protocal], base)
    console.log('waiting for start ...')
    Promise.all(init_urls.map(toPromise)).then(function () {
        console.log(`server start on ${base}`)
        withStart && spawn(os.type().match(/Windows/) ? 'explorer' : 'open', [base])
    }).catch(err => console.log(err))
}
module.exports = ({
    port = conf.port,
    host = conf.host,
    open = false
}) => {
    if (host) {
        port = port || 80
        HOSTS(host)
    }
    if (port) {
        port = port | 0
    }

    if (port) {
        setConf({port, host, root})
        conf.onServerCreate(createServer(port))
        open && explorer(port, host, conf.init_urls)
    } else {
        PORT().then(port => {
            setConf({port, host, root})
            conf.onServerCreate(createServer(port))
            open && explorer(port, host, conf.init_urls)
        }).catch(err => console.error(err))
    }
}
