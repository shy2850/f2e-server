
exports.getUtils = () => {
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
