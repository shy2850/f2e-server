// @ts-check
const mime = require('mime')

/**
 *
 * @param {string} pathname
 * @returns {boolean}
 */
const isText = pathname => {
    const type = mime.getType(pathname)
    return /\b(html?|txt|javascript|json)\b/.test(type)
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
     * @type {NodeJS.Dict<string | string[]>}
     */
    let params = {}
    searchParams.forEach((v, k) => {
        if (params[k]) {
            params[k] = [].concat(params[k]).concat(v)
        } else {
            params[k] = v
        }
    })
    return params
}
const pathname_fixer = (str = '') => (str.match(/[^/\\]+/g) || []).join('/')

module.exports = {
    isText, decode, queryparam, pathname_fixer
}
