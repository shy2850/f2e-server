const { argv } = process
const build = argv[argv.length - 1] === 'build'
const { join } = require('path')

module.exports = {
    livereload: !build,
    build,
    gzip: true,
    useLess: true,
    middlewares: [
        {middleware: 'template'},
        () => {
            return {
                onRoute: p => {
                    if (!p) return 'pages/index.html'
                },
            }
        }
    ],
    output: join(__dirname, './docs'),
    // onServerCreate: (server) => {
    //     const { Server } = require('ws')
    //     const wss = new Server({server});
    //     wss.on('connection', (socket) => {
    //         socket.send('init')
    //     })
    // }
}
