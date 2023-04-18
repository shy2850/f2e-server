// @ts-check
const _ = require('lodash')
const emptyFn = () => 1

/**
 * @type {import('../../index').MiddlewareCreater}
 */
module.exports = (conf) => {
    const {
        output,
        build,
        shouldUseMinify = emptyFn
    } = conf
    if (!output) {
        return
    }
    return {
        async onSet (pathname, data, store) {
            if (_.isPlainObject(data)) {
                return data
            }
            if (!build || !data || !shouldUseMinify(pathname, data)) {
                return data
            }
            return require('../util/minify').execute(pathname, data)
        },
        onRoute (pathname, req, resp, memory) {
            if (pathname === 'server-build-output') {
                require('../util/build')(() => {
                    resp.end('build ok!')
                })
                return false
            }
        }
    }
}
