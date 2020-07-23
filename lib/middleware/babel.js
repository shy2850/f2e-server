// @ts-check
const _ = require('lodash')
/**
 * @type {import('../../index').MiddlewareCreater}
 */
module.exports = conf => {
    const {
        useBabel,
        build,
        getModuleId,
        sourceMap = false
    } = conf
    // 不设置 useBabel 则不设置中间件
    if (!useBabel) {
        return
    }
    /** @type {any} */
    const {
        _suffix = /\.[jet]sx?$/,
        ...options
    } = useBabel

    const babel = require('babel-core')
    return {
        onSet (pathname, data, store) {
            if (_.isPlainObject(data)) {
                return data
            }
            if (_suffix.test(pathname)) {
                try {
                    /** @type {import('babel-core').TransformOptions} */
                    const opt = Object.assign({
                        sourceRoot: '',
                        minified: !!build,
                        sourceMaps: !!sourceMap,
                        getModuleId,
                        filename: pathname
                    }, options)

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
