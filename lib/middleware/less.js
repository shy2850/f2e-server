const path = require('path')
const _ = require('lodash')

module.exports = conf => {
    if (!conf.useLess) {
        return
    }
    return {
        onSet (pathname, data, store) {
            if (/\.less$/.test(pathname)) {
                let pathArrs = pathname.replace(/\.less$/, '.css').match(/[^\\/]+/g)
                require('less').render(data.toString(), {
                    paths: [ path.dirname(pathname) ],
                    compress: false
                }, function (err, output) {
                    if (err) {
                        console.log(err)
                    } else {
                        _.set(store, pathArrs, output.css + '')
                    }
                })
            }
        },
        outputFilter (pathname, data) {
            return !/\.less$/.test(pathname)
        }
    }
}
