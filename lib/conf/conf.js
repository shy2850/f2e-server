// @ts-check
const path = require('path')
const fs = require('fs')
const { getConfig } = require('../conf/F2E_CONFIG')
const root = process.cwd()
const _ = require('lodash')

const renderCfg = (cf) => {
    let conf = {}
    if (fs.existsSync(cf)) {
        try {
            conf = require(cf)
        } catch (e) {
            console.error(`${getConfig()} error`, e)
        }
    } else {
        console.info(`\n  no\n    ${getConfig()}! \n  run\n    'f2e conf' `)
    }
    return conf
}

/**
 * @param {import('../../index').F2EConfig} c
 * @returns {import('../../index').F2EConfig}
 */
module.exports = (c = {}) => {
    if (!c.root) {
        c.root = root
    }
    const conf = renderCfg(path.join(c.root, getConfig()))
    if (conf.root) {
        c.root = conf.root
    }
    return _.cloneDeep(_.extend({
        onServerCreate: () => {},
        buildFilter: (pathname) => !/node_modules|([\\/]|^)\./.test(pathname)
    }, conf, c))
}
