const fs = require('fs')
const path = require('path')
const _ = require('lodash')

module.exports = conf => {
    // 不设置 useBabel 则不设置中间件
    if (!conf.useBabel) {
        return
    }
    const configrc = path.resolve(conf.root, '.babelrc')
    let babelConfig = {
        presets: ['es2015']
    }
    if (fs.existsSync(configrc)) {
        Object.assign(babelConfig, JSON.parse(fs.readFileSync(configrc).toString()))
    }
    return {
        onSet (pathname, data, store) {
            if (/\.jsx?$/.test(pathname)) {
                try {
                    let code = require('babel-core').transform(data.toString(), babelConfig).code
                    _.set(store, pathname.match(/[^\\/]+/g), code)
                    return code
                } catch (e) {
                    console.log(e)
                    return data
                }
            }
        },
        outputFilter (pathname, data) {
            return !/\.jsx$/.test(pathname)
        }
    }
}
