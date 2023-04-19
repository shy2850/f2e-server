// @ts-check
const { readdirSync } = require('fs')
const path = require('path')
const _ = require('lodash')
const pathREG = /[^\\/]+/g

/**
 * @type {import('../../index').MiddlewareCreater}
 */
module.exports = conf => {
    const { useLess, build } = conf
    if (!useLess) {
        return
    }

    /** @type {LessStatic} */
    let less
    try {
        less = require('less')
    } catch (e) {
        console.error('useLess 需要安装less依赖 \n npm i less@4 --save-dev')
        process.exit(1)
    }
    let imports = {}

    return {
        onSet: function (pathname, data, store) {
            if (_.isPlainObject(data)) {
                return data
            }
            if (/\.less$/.test(pathname)) {
                return new Promise((resolve, reject) => {
                    const outputPath = pathname.replace(/\.less$/, '.css')
                    const outputMapPath = outputPath.replace(/\.css$/, '.css.map')
                    const lessStr = (data && data.toString()) || ''
                    less.render(lessStr.replace(/(@import.*)"(\S*\/)"/g, (impt, pre, dir) => {
                        let pkg = path.join(path.dirname(pathname), dir)
                        const d = pkg.match(pathREG) || []
                        const p = pathname.match(pathREG) || []
                        _.set(imports, [d.join('/'), p.join('/')], 1)
                        return readdirSync(pkg)
                            .filter(d => /\.less$/.test(d)).map(d => `${pre}"${dir}${d}";`).join('\n')
                    }), Object.assign({
                        javascriptEnabled: true,
                        paths: [path.dirname(pathname)],
                        sourceMap: {
                            sourceMapURL: outputMapPath.split('/').pop(),
                            outputSourceFiles: true
                        },
                        compress: !!build
                    }, useLess), function (err, output) {
                        if (err) {
                            reject(err)
                        } else if (output) {
                            output.imports.map(dep => {
                                const d = dep.match(pathREG) || []
                                const p = pathname.match(pathREG) || []
                                _.set(imports, [d.join('/'), p.join('/')], 1)
                                conf.__ignores__.add(d.join('/'))
                            })
                            let data = output.css + ''
                            if (output.map) {
                                store._set(outputMapPath, output.map)
                            }
                            resolve({ data, outputPath, end: true })
                        }
                    })
                }).catch(err => console.trace(pathname, err))
            }
        },
        buildWatcher (pathname, type, build) {
            const importsMap = imports[pathname]
            if (type === 'change' && importsMap) {
                Object.keys(importsMap).map(dep => {
                    build(dep)
                })
            }
        },
        outputFilter (pathname, data) {
            return !/\.less$/.test(pathname)
        }
    }
}
