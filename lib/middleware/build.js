const CleanCSS = require('clean-css')
const uglifyJs = require('uglify-js')

const cleanCss = new CleanCSS({ compatibility: '*' })

module.exports = (conf) => {
    const {output, build} = conf

    if (!output) {
        return
    }
    return {
        onGet (pathname, data) {
            if (!build) {
                return data
            } else if (pathname.match(/\.js$/)) {
                try {
                    return uglifyJs.minify(data.toString()).code || data
                } catch (e) {
                    return data
                }
            } else if (pathname.match(/\.css$/)) {
                return cleanCss.minify(data.toString()).styles || data
            } else {
                return data
            }
        },
        onRoute (pathname, req, resp, memory) {
            if (pathname === '/server-build-output') {
                require('../util/build')(() => {
                    resp.end('build ok!')
                })
                return false
            }
        },
        onDirectory (pathname, items) {
            items.push({
                name: '&lt;构建输出&gt;',
                href: '/server-build-output'
            })
        }
    }
}
