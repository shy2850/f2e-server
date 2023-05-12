require('.')({
    root: './lib',
    onServerCreate: function (server, conf) {
        console.log('server:', server)
        console.log('conf:', conf)
    }
})
