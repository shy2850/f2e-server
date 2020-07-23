// @ts-check

/**
 * @type {import('../../index').MiddlewareCreater}
 */
module.exports = conf => {
    const {
        // @ts-ignore
        _setModuleSuffix = /\.[jet]sx?$/,
        getModuleId,
        // @ts-ignore
        _REG_AMD = /(^define\(|[^.\w]define\()(?!\s*['"()])/
    } = conf

    const setModuleId = (code, moduleId) => code.replace(_REG_AMD, `$1"${moduleId}", `)

    return {
        onSet (pathname, data) {
            if (getModuleId && _setModuleSuffix.test(pathname)) {
                let moduleId = getModuleId(pathname.replace(_setModuleSuffix, ''))
                return setModuleId(data.toString(), moduleId)
            }
        }
    }
}
