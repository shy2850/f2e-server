# f2e-serve
f2e-server 的服务端开发工具

## 基本用法


```js
import { MiddlewareCreater } from 'f2e-server'
import { Route, out } from 'f2e-serve'
import * as fs from 'fs'

// 以f2e-server中间件的模式构建模块
const creater: MiddlewareCreater = (conf) => {
    const dosomething = async (req) => {
        return { success: true, data: req.data }
    }
    const download = () => fs.readFileSync('xx.pdf')

    const route = new Route()
    route.on('api/dosomething', out.JsonOut(dosomething, conf));    // 普通json接口返回
    route.on('api/dosomething.js', out.JsonpOut(dosomething, conf));    // 支持callback参数的jsonp接口返回
    route.on('api/doingsomething', out.ServerSent(dosomething, { ...conf, interval: 2000 }));  // 支持serverSent每2000ms一次推送
    route.on('xx.pdf', out.Base('application/octet-stream')(download, conf))    // 支持原始数据输出

    return {
        onRoute: route.execute
    }
}
export default creater
```