const path = require('path')
const _ = require('lodash')

module.exports = conf => {
    if (!conf.useLess) {
        return
    }
    return {
        onSet (pathname, data, store) {
            if (/\.less$/.test(pathname)) {
                require('less').render(data.toString(), {
                    paths: [ path.dirname(pathname) ],
                    compress: false
                }, function (err, output) {
                    if (err) {
                        console.log(err)
                    } else {
                        store._set(pathname.replace(/\.less$/, '.css'), output.css + '')
                    }
                })
            }
        },
        outputFilter (pathname, data) {
            return !/\.less$/.test(pathname)
        }
    }
}
