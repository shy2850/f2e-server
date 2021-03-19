// @ts-check
const path = require('path')
/** @type {any} */
const mime = require('mime')
const fs = require('fs')
const querystring = require('querystring')
const _ = require('lodash')

const pathClear = pathname => pathname.match(/[^\\/]+/g).join('/')
const isText = pathname => {
    const type = mime.getType(pathname)
    return /\b(html?|css|txt|javascript|json)\b/.test(type)
}

/**
 * @type {import('../../index').MiddlewareCreater}
 */
module.exports = conf => {
    const {
        include = [
            /\$include\[["'\s]*([^"'\s]+)["'\s]*\](?:\[["'\s]*([^"'\s]+)["'\s]*\])?/g
            // /@import\s*["']([^,"';]+),?([^,"';]*)["'];?/g
        ],
        belong = /\$belong\[["'\s]*([^"'\s]+)["'\s]*\]/,
        placeholder = '$[placeholder]',
        build,
        root
    } = conf

    const includeFile = (urlPath, minFilePath, store) => {
        const [pathname, query] = urlPath.split('?')
        const param = querystring.parse(query)
        let data = store._get(pathname, root)
        let filePath = path.join(root, pathname)
        if (typeof data === 'undefined') {
            if (minFilePath) {
                minFilePath = path.join(root, minFilePath)
            } else {
                minFilePath = filePath.replace(/(\w+)$/, 'min.$1')
            }
            if (build && fs.existsSync(minFilePath)) {
                return fs.readFileSync(minFilePath).toString()
            } else {
                data = fs.readFileSync(filePath).toString().replace(/\$\{(\w+)\}/g, function (all, name) {
                    return param[name] ? param[name].toString() : all
                })
            }

            if (build) {
                const {
                    cleanCss,
                    uglifyJs,
                    uglifyEs
                } = require('../util/minify').getUtils()

                if (/\.(js|ts|es)$/.test(pathname)) {
                    let res = uglifyEs.minify({ [filePath]: data })
                    if (!res.code) {
                        res = uglifyJs.minify({ [filePath]: data })
                    }
                    res.error && console.error(res.error)
                    res.warnings && console.warn(res.warnings)
                    res.code && (data = res.code)
                }
                if (/\.(css|less|sass)$/.test(pathname)) {
                    let res = cleanCss.minify({ [filePath]: data })
                    res.errors && console.error(res.errors)
                    res.warnings && console.warn(res.warnings)
                    res.styles && (data = res.styles)
                }
            }
        }
        return data
    }

    if (!include) {
        return
    }

    let imports = {}
    return {
        onSet (pathname, data, store) {
            if (_.isPlainObject(data)) {
                return data
            }
            try {
                if (isText(pathname) || (conf.isText && conf.isText(pathname))) {
                    pathname = pathname.replace(/[^\\/]+$/, '')
                    /** @type {any} */
                    let belongStr = ''
                    let str = data.toString()
                    let h = belong.exec(str)

                    if (h) {
                        let belongPath = /^[\\/]/.test(h[1]) ? h[1] : path.join(pathname, h[1])
                        belongStr = store._get(belongPath) || fs.readFileSync(path.join(root, belongPath)).toString()
                        str = str.replace(h[0], '')
                        str = belongStr.toString().replace(placeholder, str)
                        const d = pathClear(belongPath)
                        _.set(imports, [d, pathname], 1)
                        conf.__ignores__.add(d)
                    }

                    for (let i = 0; i < include.length; i++) {
                        const _include = include[i]
                        if (_include.test(str)) {
                            while (str.match(_include)) {
                                str = str.replace(_include, function (all, filename, minFilePath) {
                                    let includePath = /^[\\/]/.test(filename) ? filename : path.join(pathname, filename)
                                    const d = pathClear(includePath)
                                    _.set(imports, [d, pathname], 1)
                                    conf.__ignores__.add(d)
                                    if (typeof minFilePath !== 'string') {
                                        minFilePath = null
                                    } else {
                                        minFilePath = /^[\\/]/.test(minFilePath) ? minFilePath : path.join(pathname, minFilePath)
                                    }
                                    return includeFile(includePath, minFilePath, store)
                                })
                            }
                        }
                    }
                    return str
                }
            } catch (e) {
                console.log(e)
            }
        },
        buildWatcher (pathname, type, build) {
            const importsMap = imports[pathname]
            if (type === 'change' && importsMap) {
                Object.keys(importsMap).map(dep => {
                    build(dep)
                })
            }
        }
    }
}
