const path = require('path')
const fs = require('fs')
const F2E_CONFIG = require('../conf/F2E_CONFIG')
const root = process.cwd()
const _ = require('lodash')

const renderCfg = (cf) => {
    let conf = {}
    if (fs.existsSync(cf)) {
        try {
            conf = require(cf)
        } catch (e) {
            console.error(`${F2E_CONFIG} error`, e)
        }
    } else {
        console.info(`\n  no\n    ${F2E_CONFIG}! \n  run\n    'f2e conf' `)
    }
    return conf
}

module.exports = (c = {}) => {
    if (!c.root) {
        c.root = root
    }
    const conf = renderCfg(path.join(c.root, F2E_CONFIG))
    if (conf.root) {
        c.root = conf.root
    }
    return _.cloneDeep(_.extend({
        onServerCreate: (server) => {},
        buildFilter: (pathname, data) => !/node_modules|([\\/]|^)\./.test(pathname)
    }, conf, c))
}
