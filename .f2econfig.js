module.exports = {
    // host: 'f2e.local.cn',
    /**
     * 是否开启自动刷新
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
    useBabel: true,
    /**
     * 是否支持 gzip
     * @type {Boolean}
     */
    gzip: true,

    /**
     * 支持中间件列表, 默认添加的系统中间件后面, build之前
     *
     * ☆ 重要的
     * 1. 自定义中间件中所有事件 onXxx 也支持在外面定义， 在组件内更显条理, 而且也方便自己封装插件多处引入
     * 2. 系统中间件顺序 include(0) -> less(1) -> babel(2) ---> build(last)
     * 3. 顶层定义的事件顺序在系统中间件之前
     * @type {Array<Function>}
     */
    middlewares: [
        /*
        {
            test: /^docs/,
            middleware: 'proxy',
            url: 'https://f2e-server.com',
            pathname: ''
        },
        */
        
        {
            middleware: 'markdown'
        },
        {
            test: /.html$/,
            middleware: 'template'
        }
    ],
    /**
     * 只构建指定条件的资源
     * @param  {string} pathname 资源路径名
     * @param  {Buffer/string} data     资源内容
     * @return {Boolean}
     */
    buildFilter: (pathname, data) => {
        // 路径过滤
        let nameFilter = !pathname || /docs|lib|test|index|README/.test(pathname)
        // 资源大小过滤
        let sizeFilter = !data || data.toString().length < 1024 * 1024
        return nameFilter && sizeFilter
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
    // app: 'static',
    output: require('path').join(__dirname, '../output')
}
