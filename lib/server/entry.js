const getConfig = require('../conf/get')
module.exports = (req, resp, next) => {
    // 获取 host & port
    let [hostname, port = 80] = (req.headers.host + '').split(':')
    if (req.client.ssl) {
        port = 443
    }

    // 获取 config
    const conf = getConfig(hostname, port)
    const {
        handleError
    } = require('../util/resp')(conf)
    if (!conf) {
        handleError(resp, {error: 'host not found!'})
    } else {
        conf.app(req, resp, next, conf)
    }
}
