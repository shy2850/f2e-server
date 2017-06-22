const path = require('path')
const fs = require('fs')
const F2E_CONFIG = require('../conf/F2E_CONFIG')
const root = process.cwd()
const cfgFile = path.join(root, F2E_CONFIG)
const _ = require('lodash')

let conf = {}
if (fs.existsSync(cfgFile)) {
    try {
        conf = require(cfgFile)
    } catch (e) {
        console.error(`${F2E_CONFIG} error`, e)
    }
} else {
    console.info(`\n  no\n    ${F2E_CONFIG}! \n  run\n    'f2e conf' `)
}

module.exports = c => _.cloneDeep(_.extend({root}, conf, c))
