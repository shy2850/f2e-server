// @ts-check

const { argv } = process
const build = process.env['NODE_ENV'] === 'build' || argv[argv.length - 1] === 'build'
const { join } = require('path')

/**
 * @type {import('./index').F2EConfig}
 */
const config = {
    livereload: !build,
    build,
    // app: 'static',
    // __withlog__: true,
    gzip: true,
    // useLess: true,
    middlewares: [
        { middleware: 'template', test: /\.html?/ },
        // () => {
        //     return {
        //         onRoute: p => {
        //             if (!p) return 'index.html'
        //         },
        //     }
        // }
    ],
    // try_files: 'index.html',
    output: join(__dirname, './output'),
    // onServerCreate: (server) => {
    //     const { Server } = require('ws')
    //     const wss = new Server({server});
    //     wss.on('connection', (socket) => {
    //         socket.send('init')
    //     })
    // }
    // authorization: 'admin:admin'
}
module.exports = config