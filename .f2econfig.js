const { argv } = process
const build = argv[argv.length - 1] === 'build'
module.exports = {
    livereload: !build,
    build,
    gzip: true,
    // app: 'static',
    middlewares: [
        {
            middleware: 'template'
        }
    ],
    output: require('path').join(__dirname, '../f2e-output')
}
