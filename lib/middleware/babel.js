const fs = require('fs')
const path = require('path')
const _ = require('lodash')

module.exports = conf => {
    // 不设置 useBabel 则不设置中间件
    if (!conf.useBabel) {
        return
    }
    const babel = require('babel-core')
    let index = 0
    return {
        onSet (pathname, data, store) {
            if (/\.(es|js)x?$/.test(pathname)) {
                try {
                    const result = babel.transform(data + '', _.extend({
                        sourceRoot: conf.root,
                        filename: pathname
                    }))
                    store._set(pathname.replace(/\.jsx$/, '.js'), result.code)
                } catch (e) {
                    console.log(e)
                    return data
                }
            }
        },
        outputFilter (pathname, data) {
            return !/\.(es|jsx)$/.test(pathname)
        }
    }
}
