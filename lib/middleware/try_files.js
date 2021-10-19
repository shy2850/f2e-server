// @ts-check
const _ = require('lodash')

/**
 * @type {import('../../index').MiddlewareCreater}
 */
module.exports = conf => {
    const { try_files } = conf

    if (!try_files) {
        return null
    }

    /**
     * @type {import('../../index').TryFilesItem[]}
     */
    let tries = []
    if (typeof try_files === 'string') {
        tries.push({
            test: /.*/,
            exec: () => try_files
        })
    } else if (try_files[0] instanceof RegExp && typeof try_files[1] === 'string') {
        tries.push({
            test: try_files[0],
            exec: () => try_files[1] + ''
        })
    } else {
        // @ts-ignore
        tries = try_files
    }
    return {
        onRoute: (pathname, req, resp, memory) => {
            let data = memory._get(pathname)
            if (!data || _.isPlainObject(data)) {
                for (let i = 0; i < tries.length; i++) {
                    const item = tries[i]
                    if (item.test.test(pathname)) {
                        return item.exec(pathname, req, resp, memory)
                    }
                }
            }
        }
    }
}
