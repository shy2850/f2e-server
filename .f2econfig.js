const { argv } = process
const build = argv[argv.length - 1] === 'build'
const { join } = require('path')
const { readFileSync } = require('fs')
const marked = require('marked')

module.exports = {
    root: join(__dirname, './pages'),
    livereload: !build,
    build,
    gzip: true,
    useLess: true,
    onRoute: p => {
        if (!p) return 'index.html'
    },
    middlewares: [
        {middleware: 'template'}
    ],
    output: join(__dirname, './docs')
}
