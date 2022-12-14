
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
 * @param {string | {} | Buffer} data
 * @returns {Promise<string | {} | Buffer>}
*/
exports.execute = async (pathname, data) => {
    const {
        cleanCss,
        uglifyJs,
        uglifyEs
    } = getUtils()
    const extType = (pathname.match(/\.(\w+)$/) || [])[1]
    switch (extType) {
    case 'js':
        let js = await uglifyEs.minify(data && data.toString())
        if (!js.code) {
            js = uglifyJs.minify(data && data.toString())
        }
        return js.code
    case 'css':
        let css = cleanCss.minify(data && data.toString())
        return css.styles
    default:
        return data
    }
}
