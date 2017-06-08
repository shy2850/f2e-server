const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const GLOBAL_CONF_NAME = require('./get').GLOBAL_CONF_NAME
const cfgPath = path.resolve(__dirname, '../../../.globalf2econfig')

if (!fs.existsSync(cfgPath)) {
    fs.writeFileSync(cfgPath, '{}')
}

fs.watch(cfgPath, () => {
    let confStr = fs.readFileSync(cfgPath).toString() || '{}'
    global[GLOBAL_CONF_NAME] = JSON.parse(confStr)
})

module.exports = ({port = 80, host = 'localhost', root}) => {
    let confStr = fs.readFileSync(cfgPath).toString() || '{}'
    let conf = JSON.parse(confStr)
    _.set(conf, [port, host], root)
    global[GLOBAL_CONF_NAME] = conf
    fs.writeFile(cfgPath, JSON.stringify(conf, 0, 2))
}
