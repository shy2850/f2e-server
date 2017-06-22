const path = require('path')
const mime = require('mime')
const fs = require('fs')
const _ = require('lodash')
const pathClear = pathname => pathname.match(/[^\\/]+/g).join('/')
const isText = pathname => !!mime.charsets.lookup(mime.lookup(pathname), false)

module.exports = conf => {
    const {
        include = /\$include\[["'\s]*([^"'\s]+)["'\s]*\](\[["'\s]*([^"'\s]+)["'\s]*\])?/g,
        belong = /\$belong\[["'\s]*([^"'\s]+)["'\s]*\]/,
        placeholder = '$[placeholder]',
        build,
        root
    } = conf

    const includeFile = (pathname, type, store) => {
        let data = store._get(pathname, root)
        let filePath = path.join(root, pathname)
        let minFilePath = filePath.replace(/(\w+)$/, 'min.$1')
        if (typeof data === 'undefined') {
            if (build && fs.existsSync(minFilePath)) {
                data = fs.readFileSync(minFilePath)
            } else {
                data = fs.readFileSync(filePath) || ''
            }
        }
        switch (type) {
        case 'base64':
            return 'data:' + mime.lookup(pathname) + ';base64,' + Buffer.from(data).toString('base64')
        default:
            return data.toString()
        }
    }

    if (!include) {
        return
    }

    let imports = {}
    return {
        onSet (pathname, data, store) {
            try {
                if (isText(pathname)) {
                    const p = pathClear(pathname)
                    pathname = pathname.replace(/[^\\/]+$/, '')
                    let belongStr = ''
                    let str = data.toString()
                    let h = belong.exec(str)

                    if (h) {
                        let belongPath = /^[\\/]/.test(h[1]) ? h[1] : path.join(pathname, h[1])
                        belongStr = store._get(belongPath, root) || fs.readFileSync(path.join(root, belongPath)).toString()
                        str = str.replace(h[0], '')
                        str = belongStr.toString().replace(placeholder, str)
                        const d = pathClear(belongPath)
                        _.set(imports, [d, p], 1)
                    }

                    while (str.match(include)) {
                        str = str.replace(include, function (all, filename, type) {
                            let includePath = /^[\\/]/.test(filename) ? filename : path.join(pathname, filename)
                            const d = pathClear(includePath)
                            _.set(imports, [d, p], 1)
                            return includeFile(includePath, type, store)
                        })
                    }
                    return str
                }
            } catch (e) {
                console.log(e)
            }
        },
        buildWatcher (type, pathname, build) {
            const p = pathClear(pathname)
            const importsMap = imports[p]
            if (importsMap) {
                Object.keys(importsMap).map(dep => {
                    build(dep)
                })
            }
        }
    }
}
