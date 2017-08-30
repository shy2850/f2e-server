const _ = require('lodash')
module.exports = conf => {
    const {
        useBabel,
        build,
        /**
         * 匹配修改 moduleId
         */
        REG_AMD = /(^define\(|[^.\w]define\()(?!\s*['"])/
    } = conf
    // 不设置 useBabel 则不设置中间件
    if (!useBabel) {
        return
    }
    const {
        _rules = [],
        _suffix = /\.(es|js)x?$/
    } = useBabel
    let babelCfg = {}
    _.map(useBabel, (v, k) => /_/.test(k) || (babelCfg[k] = v))
    const setModuleId = (code, moduleId) => code.replace(REG_AMD, `$1"${moduleId}", `)
    const babel = require('babel-core')
    const {util: {regexify}} = babel

    return {
        onSet (pathname, data, store) {
            if (_.isPlainObject(data)) {
                return data
            }
            if (_suffix.test(pathname)) {
                try {
                    const opt = Object.assign({
                        sourceRoot: '',
                        minified: !!build,
                        filename: pathname
                    }, babelCfg, _rules.find(({only = '*'}) => regexify(only).test(pathname)))

                    const result = babel.transform(data + '', opt)
                    const newPath = pathname.replace(_suffix, '.js')
                    if (opt.getModuleId) {
                        let moduleId = opt.getModuleId(pathname.replace(_suffix, ''))
                        result.code = setModuleId(result.code, moduleId)
                    }
                    store._set(newPath, result.code)
                    if (build || newPath === pathname) {
                        return result.code
                    }
                } catch (e) {
                    console.log(e)
                    return data
                }
            }
        },
        outputFilter (pathname, data) {
            return !_suffix.test(pathname)
        }
    }
}
