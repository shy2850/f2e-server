// @ts-check
const path = require('path')
const { pathname_fixer } = require('../util/misc')

/**
 * @type {import('../../index').MiddlewareCreater}
 */
module.exports = (conf) => {
    const namehash = Object.assign({
        entries: ['index\\.html$'],
        searchValue: ['\\s(?:src)="([^"]*?)"', '\\s(?:href)="([^"]*?)"'],
        replacer: (output, hash) => `/${output}?${hash}`
    }, conf.namehash || {})

    const needhash = new RegExp(namehash.entries.join('|'))
    const searchValues = namehash.searchValue.map(t => new RegExp(t, 'g'))
    return {
        async onGet (pathname, data, memory, map) {
            if (data && needhash.test(pathname)) {
                let result = data.toString()
                for (let i = 0; i < searchValues.length; i++) {
                    const searchValue = searchValues[i]
                    result = result.replace(searchValue, function (_, a) {
                        const p = pathname_fixer(path.join(path.dirname(pathname), a))
                        const out = map.get(p)
                        return out ? _.replace(a, () => namehash.replacer(out.output, out.hash)) : _
                    })
                }
                return result
            }
        }
    }
}
