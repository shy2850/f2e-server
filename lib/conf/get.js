// @ts-check
const GLOBAL_CONF_NAME = 'GLOBAL_CONF_NAME'
const _ = require('lodash')
const IP = require('../util/IP')
const path = require('path')

/**
 * @type {import('../../index').F2EConfig & { app: string }}
 */
const defaultConf = {
    livereload: true,
    buildFilter: (pathname) => !/node_modules|([\\/]|^)\./.test(pathname),
    __ignores__: new Set(),
    page_404: path.join(__dirname, '../../pages/404.html'),
    page_50x: path.join(__dirname, '../../pages/50x.html'),
    page_dir: path.join(__dirname, '../../pages/dir.html'),
    app: 'memory-tree'
}
let allConfig = {}

let get = (hostname = 'localhost', port) => {
    const host = port === 443 ? ('https://' + hostname) : ('http://' + hostname + ':' + port).replace(':80', '')

    if (hostname === IP) {
        hostname = 'localhost'
    }

    const key = `${hostname}:${port}`
    /**
     * @type {import('../../index').F2EConfig & { app: string }}
     */
    let conf = allConfig[port] || allConfig[key] || allConfig[GLOBAL_CONF_NAME]
    if (!conf) {
        const root = _.get(global[GLOBAL_CONF_NAME], ['' + port, hostname]) ||
                    _.get(global[GLOBAL_CONF_NAME], ['' + port, 'localhost']) ||
                    process.cwd()
        conf = Object.assign({}, defaultConf, require('./conf')({
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
