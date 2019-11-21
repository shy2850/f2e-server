// import { F2EConfig } from 'f2e-server'

const { argv } = process
const build = process.env['NODE_ENV'] === 'build' || argv[argv.length - 1] === 'build'
const { join } = require('path')

/**
 * @type F2EConfig
 */
const config = {
    livereload: !build,
    build,
    gzip: true,
    useLess: true,
    middlewares: [
        {middleware: 'template'},
        () => {
            return {
                onRoute: p => {
                    if (!p) return 'index.html'
                },
            }
        }
    ],
    output: join(__dirname, './output'),
    // onServerCreate: (server) => {
    //     const { Server } = require('ws')
    //     const wss = new Server({server});
    //     wss.on('connection', (socket) => {
    //         socket.send('init')
    //     })
    // }
}
module.exports = config