const path = require('path')
const mime = require('mime')
const fs = require('fs')
const _ = require('lodash')
const uglifyJs = require('uglify-js')
const CleanCSS = require('clean-css')
const cleanCss = new CleanCSS({ compatibility: '*' })
const pathClear = pathname => pathname.match(/[^\\/]+/g).join('/')
const isText = pathname => !!mime.charsets.lookup(mime.lookup(pathname), false)

module.exports = conf => {
    const {
        include = /\$include\[["'\s]*([^"'\s]+)["'\s]*\](?:\[["'\s]*([^"'\s]+)["'\s]*\])?/g,
        belong = /\$belong\[["'\s]*([^"'\s]+)["'\s]*\]/,
        placeholder = '$[placeholder]',
        build,
        root
    } = conf

    const includeFile = (urlPath, minFilePath, store) => {
        const [pathname, type] = urlPath.split('?')
        let data = store._get(pathname, root)
        let filePath = path.join(root, pathname)
        if (typeof data === 'undefined') {
            if (minFilePath) {
                minFilePath = path.join(root, minFilePath)
            } else {
                minFilePath = filePath.replace(/(\w+)$/, 'min.$1')
            }
            if (build && fs.existsSync(minFilePath)) {
                data = fs.readFileSync(minFilePath)
            } else if (build && /\.js$/.test(pathname)) {
                data = uglifyJs.minify(fs.readFileSync(filePath).toString() || '').code
            } else if (build && /\.(css|less|sass)$/.test(pathname)) {
                data = cleanCss.minify(fs.readFileSync(filePath).toString() || '').styles
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
            if (_.isPlainObject(data)) {
                return data
            }
            try {
                if (isText(pathname) || (conf.isText && conf.isText(pathname))) {
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
                        _.set(imports, [d, pathname], 1)
                    }

                    while (str.match(include)) {
                        str = str.replace(include, function (all, filename, minFilePath) {
                            let includePath = /^[\\/]/.test(filename) ? filename : path.join(pathname, filename)
                            const d = pathClear(includePath)
                            _.set(imports, [d, pathname], 1)
                            if (typeof minFilePath !== 'string') {
                                minFilePath = null
                            } else {
                                minFilePath = /^[\\/]/.test(minFilePath) ? minFilePath : path.join(pathname, minFilePath)
                            }
                            return includeFile(includePath, minFilePath, store)
                        })
                    }
                    return str
                }
            } catch (e) {
                console.log(e)
            }
        },
        buildWatcher (pathname, type, build) {
            const importsMap = imports[pathname]
            if (importsMap) {
                Object.keys(importsMap).map(dep => {
                    build(dep)
                })
            }
        }
    }
}
