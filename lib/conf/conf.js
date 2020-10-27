// @ts-check
const path = require('path')
const fs = require('fs')
const { getConfig } = require('../conf/F2E_CONFIG')
const root = process.cwd()
const _ = require('lodash')

/**
 * @type {import('../../index').F2EConfig & { app?: string }}
 */
const defaultConf = {
    livereload: true,
    buildFilter: (pathname) => !/node_modules|([\\/]|^)\./.test(pathname),
    __ignores__: new Set(),
    page_404: path.join(__dirname, '../../pages/404.html'),
    page_50x: path.join(__dirname, '../../pages/50x.html'),
    page_dir: path.join(__dirname, '../../pages/dir.html'),
    max_body_parse_size: 1024 * 100,
    app: 'memory-tree'
}
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
    return Object.assign({}, defaultConf, conf)
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
