const _ = require('lodash')
module.exports = conf => {
    const {
        useBabel,
        build,
        sourceMap = true
    } = conf
    // 不设置 useBabel 则不设置中间件
    if (!useBabel) {
        return
    }
    const {
        _rules = [],
        _suffix = /\.[jet]sx?$/
    } = useBabel
    let babelCfg = {}
    _.map(useBabel, (v, k) => /_/.test(k) || (babelCfg[k] = v))
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
                        sourceMaps: !!sourceMap,
                        filename: pathname
                    }, babelCfg, _rules.find(({only = '*'}) => regexify(only).test(pathname)))

                    const result = babel.transform(data + '', opt)
                    const newPath = pathname.replace(_suffix, '.js')
                    store._set(newPath, result.code)
                    if (build && sourceMap) {
                        store._set(newPath + '.map', result.map)
                    }
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
            return /\.js$/.test(pathname) || !_suffix.test(pathname)
        }
    }
}
