// @ts-check
const mime = require('mime')

/**
 *
 * @param {string} pathname
 * @returns {boolean}
 */
const isText = pathname => {
    const type = mime.getType(pathname)
    return /\b(html?|txt|javascript|json)\b/.test(type || 'exe')
}

/**
 *
 * @param {string} str
 * @returns {string}
 */
const decode = str => {
    try {
        return decodeURIComponent(str)
    } catch (e) {
        return str
    }
}
/**
 *
 * @param { URLSearchParams } searchParams
 */
function queryparam (searchParams) {
    /**
     * @type {Record<string, string | string[]>}
     */
    let params = {}
    searchParams.forEach((v, k) => {
        if (params[k]) {
            // @ts-ignore
            params[k] = [].concat(params[k]).concat(v)
        } else {
            params[k] = v
        }
    })
    return params
}
const pathname_fixer = (str = '') => (str.match(/[^/\\]+/g) || []).join('/')
const pathname_dirname = (str = '') => (str.match(/[^/\\]+/g) || []).slice(0, -1).join('/')

module.exports = {
    isText, decode, queryparam, pathname_fixer, pathname_dirname
}
