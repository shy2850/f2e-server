const GLOBAL_CONF_NAME = 'GLOBAL_CONF_NAME'
const _ = require('lodash')
const path = require('path')
const fs = require('fs')

let allConfig = {}

let get = (hostname = 'localhost', port) => {
    const key = `${hostname}:${port}`
    let conf = allConfig[key]
    if (!conf) {
        const root = _.get(global[GLOBAL_CONF_NAME], ['' + port, hostname])
        conf = {
            root
        }
        const cfgFile = path.resolve(root, 'f2e-conf.js')
        if (fs.existsSync(cfgFile)) {
            Object.assign(conf, require(cfgFile))
        }
        allConfig[key] = conf
    }
    return conf
}
get.GLOBAL_CONF_NAME = GLOBAL_CONF_NAME
module.exports = get
