const { readdirSync } = require('fs')
const path = require('path')
const _ = require('lodash')
const pathREG = /[^\\/]+/g
module.exports = conf => {
    const {useLess, build} = conf
    if (!useLess) {
        return
    }
    const less = require('less')
    let imports = {}

    return {
        onSet: function (pathname, data, store) {
            if (_.isPlainObject(data)) {
                return data
            }
            if (/\.less$/.test(pathname)) {
                return new Promise((resolve, reject) => {
                    less.render(data.toString().replace(/(@import.*)"(\S*\/)"/g, (impt, pre, dir) => {
                        let pkg = path.join(path.dirname(pathname), dir)
                        const d = pkg.match(pathREG).join('/')
                        const p = pathname.match(pathREG).join('/')
                        _.set(imports, [d, p], 1)
                        return readdirSync(pkg)
                            .filter(d => /\.less$/.test(d)).map(d => `${pre}"${dir}${d}";`).join('\n')
                    }), Object.assign({
                        javascriptEnabled: true,
                        paths: [ path.dirname(pathname) ],
                        compress: !!build
                    }, useLess), function (err, output) {
                        if (err) {
                            reject(err)
                        } else {
                            output.imports.map(dep => {
                                const d = dep.match(pathREG).join('/')
                                const p = pathname.match(pathREG).join('/')
                                _.set(imports, [d, p], 1)
                            })
                            resolve({
                                data: output.css + '',
                                outputPath: pathname.replace(/\.less$/, '.css')
                            })
                        }
                    })
                }).catch(err => console.trace(pathname, err))
            }
        },
        buildWatcher (pathname, type, build) {
            const p = pathname.match(pathREG)
            let importsMap = (function (len) {
                let res
                while (len-- > 0) {
                    res = imports[p.slice(0, len).join('/')]
                    if (res) {
                        return res
                    }
                }
            })(p && p.length)
            if (p && importsMap) {
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
