// @ts-check
const path = require('path')
const fs = require('fs')
const { getConfigPath } = require('./F2E_CONFIG')
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
    shouldUseCompressor: (pathname, size) => isText(pathname) && size > 4096,
    shouldUseMinify: () => true,
    __ignores__: new Set(),
    page_init: fs.readFileSync(path.join(__dirname, '../../pages/init.html')).toString(),
    page_404: path.join(__dirname, '../../pages/404.html'),
    page_50x: path.join(__dirname, '../../pages/50x.html'),
    page_dir: path.join(__dirname, '../../pages/dir.html'),
    onServerCreate: () => {},
    app: 'memory-tree'
}
const _renderConf = (cf) => {
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
const renderConf = (c = {}) => {
    const root = process.cwd()
    Object.keys(c).forEach(k => {
        if (typeof c[k] === 'undefined') {
            delete c[k]
        }
    })
    if (c.root && !path.isAbsolute(c.root)) {
        c.root = path.join(root, c.root)
    }
    const configPath = getConfigPath()
    const conf = configPath ? _renderConf(path.join(root, configPath)) : { root, livereload: false }
    const final = _.clone(_.extend({}, defaultConf, conf, c))
    if (typeof final.app === 'string') {
        final.app = require(path.join(__dirname, `../apps/${final.app}`))
    }
    return final
}

/**
 * @type {Map<string, import('../../index').F2EConfig>}
 */
const map_config = new Map()

/**
 * @param {string} origin
 * @param {import('../../index').F2EConfig} conf
 */
const setConfig = (origin, conf) => map_config.set(origin, conf)
const getConfig = (origin = '') => map_config.get(origin)

module.exports = {
    renderConf,
    setConfig,
    getConfig
}
