// @ts-check
const _ = require('lodash')

/**
 * @type {import('../../index').MiddlewareCreater}
 */
module.exports = conf => {
    const { try_files } = conf

    if (!try_files) {
        // @ts-ignore
        return null
    }

    /**
     * @type {import('../../index').TryFilesItem[]}
     */
    let tries = []
    if (typeof try_files === 'string') {
        tries.push({
            test: /.*/,
            index: try_files
        })
    } else {
        // @ts-ignore
        tries = try_files
    }
    return {
        onRoute: (pathname, req, resp, memory) => {
            for (let i = 0; i < tries.length; i++) {
                const item = tries[i]
                if (item.test.test(pathname)) {
                    let p = pathname
                    if (item.replacer) {
                        // @ts-ignore
                        p = pathname.replace(item.test, item.replacer)
                    }
                    let data = memory?._get(p)
                    if (!data || _.isPlainObject(data)) {
                        return typeof item.index === 'string' ? item.index : item.index(pathname, req, resp, memory)
                    } else {
                        return p
                    }
                }
            }
            
        }
    }
}
