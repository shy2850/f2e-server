require('.')({
    host: 'server.local',
    port: '9999',
    root: './lib',
    try_files: 'apps/static.js',
    onServerCreate: function (server, conf) {
        console.log('server:', server)
        console.log('conf:', conf)
    }
})
