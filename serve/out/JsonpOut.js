// @ts-check
const createRespUtil = require('f2e-server/lib/util/resp')
/**
 * @type {import('../index').ExecOut}
 */
const provider = (fn, conf = {}) => (req, resp) => {
    const RespUtil = createRespUtil(conf)
    const { callback = 'callback' } = req['data']
    Promise.resolve(fn(req, resp, conf)).then(data => {
        RespUtil.handleSuccess(req, resp, '.js', `${callback}(${JSON.stringify(data)})`)
    }).catch(err => {
        console.log(err)
        RespUtil.handleError(resp, err, req)
    })
    return false
}

module.exports = provider
