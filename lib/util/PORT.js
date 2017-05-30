const tcpPortUsed = require('tcp-port-used')
const IP = require('./IP')
const PORT = 2850;

const getPort = function getPort (port) {
    tcpPortUsed(port, IP).then(() => getPort(++port))
}
module.exports = () => getPort(PORT);