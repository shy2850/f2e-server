
const getUtils = () => {
    try {
        const CleanCSS = require('clean-css')
        const cleanCss = new CleanCSS({ compatibility: '*' })

        const uglifyJs = require('uglify-js')
        const uglifyEs = require('terser')

        return {
            CleanCSS,
            cleanCss,
            uglifyJs,
            uglifyEs
        }
    } catch (e) {
        console.log('\nbuild 模式需要安装依赖:\n\t npm i clean-css uglify-js terser --save-dev\n')
        process.exit(1)
    }
}

/**
 * @param {string} pathname
 * @param {string} data
 * @returns {Promise<{ res: string, newPath: string }>}
*/
exports.execute = async (pathname, data = '') => {
    const {
        cleanCss,
        uglifyJs,
        uglifyEs
    } = getUtils()
    const extType = (pathname.match(/\.(\w+)$/) || [])[1]
    let newPath = pathname
    let res = data
    switch (extType) {
    case 'js':
        let js = await uglifyEs.minify(data)
        if (!js.code) {
            js = uglifyJs.minify(data)
        }
        newPath = pathname.replace(/\.(\w+)$/, '.js')
        res = js.code
        break
    case 'css':
        let css = cleanCss.minify(data)
        newPath = pathname.replace(/\.(\w+)$/, '.css')
        res = css.styles
        break
    default:
    }
    return {
        res, newPath
    }
}
