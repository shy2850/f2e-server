# f2e-server
f2e-server 2

## Install
`npm i -g f2e-server`

## Options
- `f2e -h`
- `f2e conf` 生成 .f2econfig.js 配置文件 [.f2econfig.js](.f2econfig.js) 的一个clone版本，需要自行修改
- `f2e build` 构建到 output 目录 (需要在配置文件中配置 output 路径)
    - `f2e build -w true` 开启构建并监听文件变化输出结果
- `f2e start` 启动开发服务器
- `f2e start -h`
    - `f2e start` 从 2850 开始自增检测可以使用的PORT并启动
    - `f2e start -p 8080` 指定端口启动
    - `sudo f2e start -p 443` 开启HTTPS支持
    - `sudo f2e start -H mysite.local` 设置本地域名并从80端口启动
    - `sudo f2e start -H mysite.local -p 8080` 设置本地域名并从指定端口启动

## Config
`f2e conf` 生成 [.f2econfig.js](.f2econfig.js) 配置文件

### 基本配置

``` javascript

const path = require('path')
const request = require('request')

module.exports = {
    // host: 'f2e.local.cn',
    // port: 2850,
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
    useBabel: {
        getModuleId: pathname => pathname.replace(/\\+/g, '/'),
        /**
         * 支持多组babel-option 配置通过 only 参数匹配，匹配到一个，则停止
         */
        _rules: [
            {
                only: ['number.js'],
                getModuleId: pathname => 'number',
            }
        ]
    },
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
        // marked 编译
        (conf) => {
            // conf 为当前配置
            return {
                /**
                 *
                 * @param {string} pathname 当前资源路径
                 * @param {Request} req 原生request对象
                 * @param {Response} resp 原生response对象
                 * @param {Object} memory 所有目录对应内存结构, get/set等方法调用会被 onSet/onGet 等拦截
                 */
                onRoute (pathname, req, resp, memory) {
                    // 搞一个代理试试
                    if (pathname.match(/^es6/)) {
                        request(pathname.replace('es6', 'http://es6.ruanyifeng.com')).pipe(resp)
                        return false
                    }
                },
                /**
                 *
                 * @param {string} eventType 事件类型 change/add/etc.
                 * @param {string} pathname 当前修改文件的路径
                 * @param {boolean} build 是否开启了build配置, build模式下可能同时需要触发其他资源修改等
                 */
                buildWatcher (eventType, pathname, build) {
                    console.log(new Date().toLocaleString(), eventType, pathname)
                },
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
                /**
                 * 跟onSet类似, 开发环境下面，每次请求都会执行, 缩短server启动时间可以把onSet的逻辑扔这里
                 */
                onGet(pathname, data, store) {},
                /**
                 * 不希望影响构建的操作, 仅在server中触发, 不希望影响构建的操作（例： 自动更新脚本插入）
                 */
                onText(pathname, data, req, resp, memory) {},
                buildFilter(pathname, data) {},
                outputFilter (pathname, data) {
                    // .md 资源server环境可见， 但是不输出
                    return !/\.md$/.test(pathname)
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
                    if (pathname.match(/^test\/.*.html/)) {
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
     * 只构建指定条件的资源
     * @param  {string} pathname 资源路径名
     * @param  {Buffer/string} data     资源内容
     * @return {Boolean}
     */
    buildFilter: (pathname, data) => {
        // 路径过滤
        let nameFilter = !pathname || /lib|test|index|README/.test(pathname)
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
    /**
     * app 默认时候 f2e 构建系统, 支持 'static' 纯静态服务器
     * 如果 app 自定义, 相当于只是使用 f2e 的端口开启和域名解析功能, 其他所有配置失效
     */
    // app: 'static',
    /**
     * 资源数据目录, 未设置的时候 build 中间件不开启
     * @type {local-url}
     */
    output: path.resolve(__dirname, '../output')
}

```

### 中间件
参考 [f2e-middleware](https://github.com/shy2850/f2e-middleware) 

1. lodash 模板引擎
2. markdown 编译
3. proxy 请求代理配置
4. dest 构建资源输出重命名
5. qrcode 简单二维码生成器

### app接入
支持接入 [Koa](http://koajs.com/) 以及 [express](https://expressjs.com/)

``` javascript
const Koa = require('koa')
const app = new Koa()

app.use(ctx => {
	ctx.body = __dirname
})


const express = require('express')
const app1 = express()

app1.get('/', function (req, res) {
  	res.send(__dirname)
})

app1.use(express.static('lib'))

module.exports = {
	// app: app.callback(),
	// app: 'static', // 纯静态资源服务器
	app: app1
}
```
