const tcpPortUsed = require('tcp-port-used')
const IP = require('./IP')
const PORT = 2850

module.exports = () => new Promise((resolve, reject) => {
    function getPort (port) {
        tcpPortUsed
            .check(port, IP)
            .then(
                inUse => inUse ? getPort(++port) : resolve(port),
                err => reject(err)
            )
    }
    getPort(PORT)
})
