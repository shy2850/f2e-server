const tcpPortUsed = require('tcp-port-used')
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

const explorer = (port = 80, host = IP) => {
    const withStart = process.argv.includes('start')
    const protocal = port === 443 ? 'https' : 'http'
    const url = protocal + '://' + host + ':' + port
    console.log('waiting for start ...')
    H.http.get(url, function (res) {
        console.log('server starting on: ' + url)
        withStart && spawn(os.type().match(/Windows/) ? 'explorer' : 'open', [ url ])
    }).on('error', function (err) {
        console.log(err)
    })
}
module.exports = ({
    port = conf.port,
    host = conf.host
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
        tcpPortUsed
            .check(port, IP)
            .then(inUse => {
                inUse || conf.onServerCreate(createServer(port))
                explorer(port, host)
            }).catch(err => console.error(err))
    } else {
        PORT().then(port => {
            setConf({port, host, root})
            conf.onServerCreate(createServer(port))
            explorer(port, host)
        }).catch(err => console.error(err))
    }
}
