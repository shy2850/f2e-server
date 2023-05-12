// @ts-check
const path = require('path')
const fs = require('fs')
const { getConfigPath } = require('../conf/F2E_CONFIG')
const _ = require('lodash')
const { exit } = require('process')
const { isText } = require('../util/misc')

/**
 * @type {import('../../index').F2EConfig & { app?: string }}
 */
const defaultConf = {
    root: process.cwd(),
    livereload: true,
    isText,
    buildFilter: (pathname) => !/node_modules|([\\/]|^)\./.test(pathname),
    __ignores__: new Set(),
    page_404: path.join(__dirname, '../../pages/404.html'),
    page_50x: path.join(__dirname, '../../pages/50x.html'),
    page_dir: path.join(__dirname, '../../pages/dir.html'),
    max_body_parse_size: 1024 * 100,
    onServerCreate: () => {},
    app: 'memory-tree'
}
const renderCfg = (cf) => {
    let conf = {}
    if (fs.existsSync(cf)) {
        try {
            conf = require(cf)
        } catch (e) {
            console.error(`${cf} error`, e)
            exit(1)
        }
    } else {
        console.info(`\n  no\n    ${cf}! \n  run\n    'f2e conf' `)
    }
    return Object.assign({}, conf)
}

/**
 * @param {import('../../index').F2EConfig} c
 * @returns {import('../../index').F2EConfig}
 */
module.exports = (c = {}) => {
    const root = process.cwd()
    if (c.root && !path.isAbsolute(c.root)) {
        c.root = path.join(root, c.root)
    }
    const configPath = getConfigPath()
    const conf = configPath ? renderCfg(path.join(root, configPath)) : { root, livereload: false }
    return _.cloneDeep(_.extend({}, defaultConf, conf, c))
}
