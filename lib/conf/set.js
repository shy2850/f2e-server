const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const GLOBAL_CONF_NAME = require('./get').GLOBAL_CONF_NAME
const cfgPath = path.join(__dirname, '../../../.globalf2econfig')
const chokidar = require('chokidar')

if (!fs.existsSync(cfgPath)) {
    fs.writeFileSync(cfgPath, '{}')
}

chokidar.watch(cfgPath).on('all', () => {
    let confStr = fs.readFileSync(cfgPath).toString() || '{}'
    global[GLOBAL_CONF_NAME] = JSON.parse(confStr)
})

module.exports = ({port = 80, host = 'localhost', root}) => {
    let confStr = fs.readFileSync(cfgPath).toString() || '{}'
    let conf = JSON.parse(confStr)
    _.set(conf, [port, host], root)
    global[GLOBAL_CONF_NAME] = conf
    fs.writeFile(cfgPath, JSON.stringify(conf, 0, 2), err => err && console.log(err))
}
