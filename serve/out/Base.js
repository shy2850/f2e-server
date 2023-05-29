// @ts-check
const createRespUtil = require('f2e-server/lib/util/resp')

/**
 * @param {string} type
 * @returns {import('../').ExecOut}
 */
const provider = (type = 'text/html') => {
    return (fn, conf = {}) => (req, resp) => {
        const RespUtil = createRespUtil(conf)
        Promise.resolve(fn(req, resp, conf)).then(data => {
            RespUtil.handleSuccess(req, resp, type, data)
        }).catch(err => {
            console.log(err)
            RespUtil.handleError(resp, err, req)
        })
        return false
    }
}
module.exports = provider
