const GLOBAL_CONF_NAME = 'GLOBAL_CONF_NAME'
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const IP = require('../util/IP')

let allConfig = {}

let get = (hostname = 'localhost', port) => {
    const host = port === 443 ? ('https://' + hostname) : ('http://' + hostname + ':' + port).replace(':80', '')

    if (hostname === IP) {
        hostname = 'localhost'
    }

    const key = `${hostname}:${port}`
    let conf = allConfig[key]
    if (!conf) {
        const root = _.get(global[GLOBAL_CONF_NAME], ['' + port, hostname]) ||
                    _.get(global[GLOBAL_CONF_NAME], ['' + port, 'localhost'])

        if (!root) {
            return
        }
        const cfgFile = path.resolve(root, '.f2econfig.js')
        conf = { host, root, port }
        if (fs.existsSync(cfgFile)) {
            Object.assign(conf, require(cfgFile))
        }
        console.log(conf)
        allConfig[key] = conf
    }
    return conf
}
get.GLOBAL_CONF_NAME = GLOBAL_CONF_NAME
module.exports = get
