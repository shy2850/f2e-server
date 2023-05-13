const fs = require('fs')
const path = require('path')

let config = null
const F2E_CONFIG = '.f2econfig.js'

exports.F2E_CONFIG = F2E_CONFIG
exports.setConfigPath = (c) => { config = c }
exports.getConfigPath = () => {
    if (!config) {
        // 没有提供配置文件路径， 但是启动目录如果有同名文件，使用此配置（兼容之前版本）
        const pathConf = path.join(process.cwd(), F2E_CONFIG)
        if (fs.existsSync(pathConf)) {
            return F2E_CONFIG
        }
    }
    return config
}
