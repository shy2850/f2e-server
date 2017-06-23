const path = require('path')

module.exports = {
    // host: 'f2e.local.cn',
    /**
     * 是否开启自动刷新, 默认为 true
     * @type {Boolean}
     */
    livereload: true,
    /**
     * 使用 less 编译为css, 使用 less 配置
     * @type {Object}
     */
    useLess: {
        compress: false
    },
    /**
     * 支持babel编译 js/es/jsx, 支持 `.babelrc` 配置,
     * @type {Object}
     */
    useBabel: {
        getModuleId: pathname => pathname.replace(/\\+/g, '/')
    },
    /**
     * 是否支持 gzip
     * @type {Boolean}
     */
    gzip: true,
    /**
     * 只输出指定条件的资源
     * @param  {string} pathname 资源路径名
     * @param  {Buffer/string} data     资源内容
     * @return {Boolean}
     */
    outputFilter: (pathname, data) => {
        let filter = /lib|test|index|README/.test(pathname)
        return !pathname || filter
    },
    /**
     * build 阶段是否使用 uglify/cleanCSS 进行 minify 操作
     * @param  {string} pathname 资源路径名
     * @param  {Buffer/string} data     资源内容
     * @return {Boolean}
     */
    shouldUseMinify: (pathname, data) => {
        let ok = data.toString().length < 1024 * 1024
        !ok && console.log('shouldNotUseMinify: ' + pathname)
        return ok
    },
    /**
     * 支持中间件列表, 默认添加的系统中间件后面, build之前
     * 系统中间件顺序 include(0) -> less(1) -> babel(2) ---> build(last)
     * @type {Array}
     */
    middlewares: [
        // marked 编译
        (conf) => {
            // conf 为当前配置
            return {
                /**
                 * onSet 设置资源内容时候触发
                 * @param  {string} pathname 当前资源路径
                 * @param  {string/Buffer} data  上一个流结束时候的数据
                 * @param  {object} store   数据仓库 {_get, _set}
                 * @return {string/Buffer}   将要设置的内容
                 */
                onSet(pathname, data, store) {
                    if (pathname.match(/\.md$/)) {
                        let res = require('marked')(data.toString())
                        // 在数据仓库中设置一个新的资源 .html
                        store._set(pathname.replace(/\.md$/, '.html'), res)
                    }
                },
                outputFilter (pathname, data) {
                    // .md 资源开发环境可见， 但是不输出
                    return !/\.md$/.test(pathname)
                },
                buildWatcher (type, pathname) {
                    console.log(new Date().toLocaleString(), type, pathname)
                }
            }
        },
        // lodash 模板引擎
        () => {
            const _ = require('lodash')
            return {
                // 中间件置顶位置 include 之后
                setBefore: 1,
                onSet (pathname, data) {
                    // data 目录下面的文本资源需要经过模板引擎编译
                    if (pathname.match(/^test[\\/]index/)) {
                        let str = data.toString()
                        try {
                            str = _.template(str)({__dirname, require})
                        } catch (e) {
                            console.log(pathname, e)
                        }
                        return str
                    }
                }
            }
        }
    ],
    /**
     * 简单资源打包方案
     */
    bundles: [
        {
            /**
             * 满足当前正则匹配，则附加到 `pathname.replace(test, dist)` 资源
             *  1. dist路径必须能够匹配资源否则无效
             *  2. test匹配到的资源(除dist外), 不再输出
             */
            test: /bundle[\\/].*/,
            dist: 'test.js'
        }
    ],
    /**
     * 资源数据目录, 未设置的时候 build 中间件不开启
     * @type {local-url}
     */
    output: path.resolve(__dirname, '../output')
}
