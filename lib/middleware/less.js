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
                less.render(data.toString(), Object.assign({
                    paths: [ path.dirname(pathname) ],
                    compress: !!build
                }, useLess), function (err, output) {
                    if (err) {
                        console.log(err)
                    } else {
                        output.imports.map(dep => {
                            const d = dep.match(pathREG).join('/')
                            const p = pathname.match(pathREG).join('/')
                            _.set(imports, [d, p], 1)
                        })
                        store._set(pathname.replace(/\.less$/, '.css'), output.css + '')
                        build && store._set(pathname, output.css + '')
                    }
                })
            }
        },
        buildWatcher (type, pathname, build) {
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
