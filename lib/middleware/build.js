// @ts-check
const CleanCSS = require('clean-css')
const uglifyJs = require('uglify-js')
const uglifyEs = require('uglify-es')
const _ = require('lodash')

const cleanCss = new CleanCSS({ compatibility: '*' })
const emptyFn = () => 1

module.exports = (conf) => {
    const {
        output,
        build,
        bundles = [
            // {
            //     test: /need_bundle\/(\w+\/)?\w+.js/,
            //     dist: 'need_bundle/$1index.js'
            // }
        ],
        shouldUseMinify = emptyFn
    } = conf

    if (!output) {
        return
    }
    let bundleMap = {}
    return {
        onSet (pathname, data, store) {
            if (_.isPlainObject(data)) {
                return data
            }
            if (build) {
                bundles.map(({test, dist}) => {
                    if (test.test(pathname)) {
                        const target = pathname.replace(test, dist)
                        _.set(bundleMap, [target, pathname], 1)
                    }
                })
            }
            if (!build || !data || !shouldUseMinify(pathname, data)) {
                return data
            }
            const extType = (pathname.match(/\.(\w+)$/) || [])[1]
            switch (extType) {
            case 'js':
                let js = uglifyEs.minify(data.toString())
                if (!js.code) {
                    js = uglifyJs.minify(data.toString())
                }
                let jsNewPath = pathname.replace(/\.(\w+)$/, '.js')
                store._set(jsNewPath, js.code)
                if (jsNewPath === pathname) {
                    return js.code
                }
                break
            case 'css':
                let css = cleanCss.minify(data.toString())
                let cssNewPath = pathname.replace(/\.(\w+)$/, '.css')
                store._set(cssNewPath, css.styles)
                if (cssNewPath === pathname) {
                    return css.styles
                }
                break
            default:
            }
            return data
        },
        outputFilter (pathname, data) {
            if (bundleMap[pathname]) {
                return true
            } else {
                // 命中一条则不输出
                return !bundles.filter(({test}) => test.test(pathname)).length
            }
        },
        onGet (pathname, data, store) {
            if (bundleMap[pathname]) {
                let res = data
                _.keys(bundleMap[pathname]).map(path => {
                    res = store._get(path) + '\r\n' + res
                })
                return res
            }
        },
        onRoute (pathname, req, resp, memory) {
            if (pathname === 'server-build-output') {
                require('../util/build')(() => {
                    resp.end('build ok!')
                })
                return false
            }
        }
    }
}
