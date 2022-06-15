const _ = require('lodash')

/**
 * @type {import('../../index').MiddlewareCreater}
 */
module.exports = conf => {
    const {
        renderHeaders = (h => h),
        try_files,
    } = conf

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
            index: try_files
        })
    } else {
        tries = try_files
    }
    return {
        onRoute: (pathname, req, resp, memory) => {
            for (let i = 0; i < tries.length; i++) {
                const item = tries[i]
                if (item.test.test(pathname)) {
                    let p = pathname
                    if (item.replacer) {
                        p = pathname.replace(item.test, item.replacer)
                    }
                    let data = memory._get(p)
                    if (!data || _.isPlainObject(data)) {
                        if (item.location) {
                            let location = typeof item.location === 'string' ? item.location : item.location(pathname, req, resp, memory)
                            resp.writeHead(302, renderHeaders({
                                location
                            }, req))
                            resp.end()
                            return false
                        } else {
                            return typeof item.index === 'string' ? item.index : item.index(pathname, req, resp, memory)
                        }
                    } else {
                        return p
                    }
                }
            }
        }
    }
}
