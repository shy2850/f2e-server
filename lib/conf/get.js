const GLOBAL_CONF_NAME = 'GLOBAL_CONF_NAME'
const _ = require('lodash')
const IP = require('../util/IP')

let allConfig = {}

let get = (hostname = 'localhost', port) => {
    const host = port === 443 ? ('https://' + hostname) : ('http://' + hostname + ':' + port).replace(':80', '')

    if (hostname === IP) {
        hostname = 'localhost'
    }

    const key = `${hostname}:${port}`
    let conf = allConfig[port] || allConfig[key] || allConfig[GLOBAL_CONF_NAME]
    if (!conf) {
        const root = _.get(global[GLOBAL_CONF_NAME], ['' + port, hostname]) ||
                    _.get(global[GLOBAL_CONF_NAME], ['' + port, 'localhost']) ||
                    process.cwd()
        conf = {
            root,
            livereload: true,
            buildFilter: (pathname, data) => !/node_modules|([\\/]|^)\./.test(pathname),
            app: 'memory-tree'
        }
        Object.assign(conf, require('./conf')({
            root,
            host,
            port
        }))

        if (_.isString(conf.app)) {
            conf.app = require(`../apps/${conf.app}`)(conf)
        }
        if (conf.no_host) {
            allConfig[port] = conf
        } else {
            allConfig[key] = conf
        }
    }
    return conf
}
get.GLOBAL_CONF_NAME = GLOBAL_CONF_NAME
module.exports = get
