const path = require('path')
const _ = require('lodash')
const fs = require('fs')
const mime = require('mime')
const isText = pathname => !!mime.charsets.lookup(mime.lookup(pathname), false)

const includeFile = (pathname, type, store, root) => {
    let data = store._get(pathname) || fs.readFileSync(path.resolve(root, pathname))
    switch (type) {
    case 'base64':
        return 'data:' + mime.lookup(pathname) + ';base64,' + Buffer.from(data).toString('base64')
    default:
        return data.toString()
    }
}
module.exports = conf => {
    const {
        include = /\$include\[["'\s]*([^"'\s]+)["'\s]*\](\[["'\s]*([^"'\s]+)["'\s]*\])?/g,
        belong = /\$belong\[["'\s]*([^"'\s]+)["'\s]*\]/,
        placeholder = '$[placeholder]',
        root
    } = conf

    if (!include) {
        return
    }

    return {
        onSet (pathname, data, store) {
            try {
                if (isText(pathname)) {
                    pathname = pathname.replace(/[^\\/]+$/, '')
                    let belongStr = ''
                    let str = data.toString()
                    let h = belong.exec(str)

                    if (h) {
                        let belongPath = /^[\\/]/.test(h[1]) ? h[1] : path.join(pathname, h[1])
                        belongStr = store._get(belongPath) || fs.readFileSync(path.resolve(root, belongPath))
                        str = str.replace(h[0], '')
                        str = belongStr.toString().replace(placeholder, str)
                    }

                    while (str.match(include)) {
                        str = str.replace(include, function (all, filename, type) {
                            let includePath = /^[\\/]/.test(filename) ? filename : path.join(pathname, filename)
                            return includeFile(includePath, type, store, root)
                        })
                    }
                    return str
                }
            } catch (e) {
                console.log(e)
            }
        }
    }
}
