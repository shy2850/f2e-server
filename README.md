# f2e-server
f2e-server 2.0

## Install
`npm i -g shy2850/f2e-server`

## Options
- `f2e -h`
- `f2e start`
- `f2e start -h`
    - `f2e start` 从 2850 开始自增检测可以使用的PORT并启动
    - `f2e start -p 8080` 指定端口启动
    - `sudo f2e start -p 443` 开启HTTPS支持
    - `sudo f2e start -H mysite.local` 设置本地域名并从80端口启动
    - `sudo f2e start -H mysite.local -p 8080` 设置本地域名并从指定端口启动

## Config
在启动目录的配置文件 `.f2econfig.js`

### 基本配置
中间件目录 [lib/middleware](lib/middleware/)
```
const path = require('path')

module.exports = {
    /**
     * 是否开启自动刷新, 默认为 true
     * @type {Boolean}
     */
    livereload: true,
    /**
     * 使用 less 编译为css， 默认为true
     * @type {Boolean}
     */
    useLess: true,
    /**
     * 是否支持babel编译 js/jsx 默认为false, 开启时 需要安装 babel6
     * @type {Boolean}
     */
    useBabel: true,
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
     * 支持中间件列表
     * @type {Array}
     */
    middlewares: [
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
                }
            }
        }
    ],
    /**
     * 资源数据目录, 未设置的时候 build 中间件不开启
     * @type {local-url}
     */
    output: path.resolve(__dirname, '../output')
}
```


### app接入
支持接入 [Koa](http://koajs.com/) 以及 [express](https://expressjs.com/)

```
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
