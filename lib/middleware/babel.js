const babel = require('babel-core')
const fs = require('fs')
const path = require('path')

module.exports = conf => {
    const configrc = path.resolve(conf.root, '.babelrc')
    let babelConfig = {
        presets: ['es2015']
    }
    if (fs.existsSync(configrc)) {
        Object.assign(babelConfig, JSON.parse(fs.readFileSync(configrc).toString()))
    }
    return {
        onSet (pathname, data) {
            if (/\.jsx?$/.test(pathname)) {
                try {
                    return babel.transform(data.toString(), babelConfig).code || data
                } catch (e) {
                    console.log(e)
                    return data
                }
            }
        }
    }
}
