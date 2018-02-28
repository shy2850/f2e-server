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
        onSet (pathname, data, store) {
            if (_.isPlainObject(data)) {
                return data
            }
            if (/\.less$/.test(pathname)) {
                return new Promise((resolve, reject) => {
                    less.render(data.toString(), Object.assign({
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
            const p = pathname.match(pathREG).join('/')
            const importsMap = imports[p]
            if (importsMap) {
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
