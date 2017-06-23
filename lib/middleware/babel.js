const REG_AMD = /([^.\w])define\((?!\s*['"])/
const setModuleId = (code, moduleId) => code.replace(REG_AMD, `$1define("${moduleId}", `)

module.exports = conf => {
    const {useBabel} = conf
    // 不设置 useBabel 则不设置中间件
    if (!useBabel) {
        return
    }
    const babel = require('babel-core')

    return {
        onSet (pathname, data, store) {
            if (/\.(es|js)x?$/.test(pathname)) {
                try {
                    const opt = Object.assign({
                        sourceRoot: '',
                        filename: pathname
                    }, useBabel)

                    const result = babel.transform(data + '', opt)
                    const newPath = pathname.replace(/\.(jsx|es)$/, '.js')
                    if (opt.getModuleId) {
                        let moduleName = opt.getModuleId(pathname.split(/[\\/]+/).join('/')).replace(/\.jsx?$/, '')
                        result.code = setModuleId(result.code, moduleName)
                    }
                    if (newPath === pathname) {
                        return result.code
                    }
                    store._set(newPath, result.code)
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
