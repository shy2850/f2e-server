// @ts-check
const path = require('path')
const fs = require('fs')
const { URLSearchParams } = require('url')
const _ = require('lodash')
const { pathname_fixer } = require('../util/misc')

/**
 * @type {import('../../index').MiddlewareCreater}
 */
module.exports = conf => {
    const {
        include = [
            /\$include\[["'\s]*([^"'\s]+)["'\s]*\](?:\[["'\s]*([^"'\s]+)["'\s]*\])?/
            // /@import\s*["']([^,"';]+),?([^,"';]*)["'];?/g
        ],
        belong = /\$belong\[["'\s]*([^"'\s]+)["'\s]*\]/,
        placeholder = '$[placeholder]',
        build,
        root
    } = conf

    /**
     * @param {string} urlPath
     * @param {string} minFilePath
     * @param {import('memory-tree').MemoryTree.Store} store
     * @returns {string}
     */
    const includeFile = (urlPath, minFilePath, store) => {
        const [pathname, query] = urlPath.split('?')
        const param = new URLSearchParams(query)
        let data = store._get(pathname)
        let filePath = path.join(root, pathname)
        if (typeof data === 'undefined') {
            if (minFilePath) {
                minFilePath = path.join(root, minFilePath)
            } if (/[.-]min\.(\w+)$/.test(filePath)) {
                minFilePath = filePath
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
        }
        return data && data.toString()
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
                if (conf.isText(pathname)) {
                    const pathnameDir = pathname.replace(/[^\\/]+$/, '')
                    /** @type {any} */
                    let belongStr = ''
                    let str = data ? data.toString() : ''
                    let h = belong.exec(str)

                    if (h) {
                        let belongPath = /^[\\/]/.test(h[1]) ? h[1] : path.join(pathnameDir, h[1])
                        belongStr = store._get(belongPath) || fs.readFileSync(path.join(root, belongPath)).toString()
                        str = str.replace(h[0], '')
                        str = belongStr.toString().replace(placeholder, str)
                        const d = pathname_fixer(belongPath)
                        _.set(imports, [d, pathnameDir], 1)
                        conf.__ignores__.add(d)
                    }
                    for (let i = 0; i < include.length; i++) {
                        const _include = include[i]
                        while (_include.test(str)) {
                            str = str.replace(_include, (al, filename, minFilePath, index) => {
                                let includePath = /^[\\/]/.test(filename) ? filename : path.join(pathnameDir, filename)
                                const d = pathname_fixer(includePath)
                                _.set(imports, [d, pathnameDir], 1)
                                conf.__ignores__ && conf.__ignores__.add(d)
                                if (typeof minFilePath !== 'string') {
                                    minFilePath = ''
                                } else {
                                    minFilePath = /^[\\/]/.test(minFilePath) ? minFilePath : path.join(pathnameDir, minFilePath)
                                }
                                return includeFile(d, minFilePath, store)
                            })
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
