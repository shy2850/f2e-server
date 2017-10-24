const IFS = require('os').networkInterfaces()
module.exports = (Object.keys(IFS)
    .map(
        x => IFS[x].filter(
            x => x.family === 'IPv4' && !x.internal
        )[0]
    )
    .filter(x => x)[0] || {address: '127.0.0.1'}).address
