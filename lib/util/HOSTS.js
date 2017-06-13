const fs = require('fs')
const os = require('os')

const hostsPath = os.type().match(/Windows/) ? 'C:\\Windows\\System32\\drivers\\etc\\hosts' : '/etc/hosts'

const getHosts = r => fs.readFileSync(hostsPath)

module.exports = (host = 'localhost') => {
    if (typeof host !== 'string') {
        console.log('hostname is needed!')
    }

    let res = getHosts().toString()
    if (host === 'reset') {
        res = res.replace(/[\n\r]?127\.0\.0\.1[^\n\r]+/g, '\n127.0.0.1 localhost')
        console.info('hostname reset ok!')
    } else if (res.indexOf(' ' + host) === -1) {
        res += '\n127.0.0.1 ' + host
    }
    fs.writeFile(hostsPath, res, err => err && console.log(err))
}
