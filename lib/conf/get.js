const GLOBAL_CONF_NAME = 'GLOBAL_CONF_NAME'
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const IP = require('../util/IP')
const F2E_CONFIG = require('./F2E_CONFIG')

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
        const cfgFile = path.join(root, F2E_CONFIG)
        conf = {
            host,
            root,
            port,
            livereload: true,
            app: 'memory-tree'
        }
        if (fs.existsSync(cfgFile)) {
            try {
                Object.assign(conf, require(cfgFile))
            } catch (e) {
                console.error(`${F2E_CONFIG} error`, e)
            }
        } else {
            console.info(`\n  no\n    ${F2E_CONFIG}! \n  run\n    'f2e conf' `)
        }
        if (_.isString(conf.app)) {
            conf.app = require(`../apps/${conf.app}`)
        }
        allConfig[key] = conf
    }
    return conf
}
get.GLOBAL_CONF_NAME = GLOBAL_CONF_NAME
module.exports = get
