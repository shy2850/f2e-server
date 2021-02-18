# CHANGELOG
## v2.14.2
- BUG修改 init_urls 触发时机修改

## v2.14.1
- 升级依赖 memmory-tree@0.6.15

## v2.14.0
- 移除babel中间件以及 babel-core 依赖所有相关
- 所有压缩相关依赖包移至 devDependencies

## v2.13.7
- beforeRoute 开始生效

## v2.13.5
- 添加参数 `max_body_parse_size` 请求body转化为UTF8字符串长度小于100K时候进行parse

## v2.13.2
- renderHeaders 支持添加统一响应头渲染参数
- port 自动寻找功能删除, 项目必须显示的配置port
## v2.13.0
- less 中间件支持map输出, 支持过滤 import 导入的源文件编译和输出
- include 模块支持过滤源文件编译和输出
- 增加 log 输出每个资源的构建时间方便调试 参数为 `__withlog__`
## v2.12.13
- build 设置cofig文件BUG修复

## v2.12.12
- update包依赖
- 修改 `index.d.ts` 描述文件
- 内置中间件添加ts-check

## v2.12.4
- update包依赖
- 修改 `include` 中间件的js代码压缩
- 修改 `index.d.ts` 描述文件

## v2.12.2
- 支持配置 `init_urls?: string[]` 当服务器启动时初始化这些url
- 目录自动更新BUG修改
- 支持配置 `authorization?: string` 
  - 提供验证账户密码 格式为 `${name}:${password}`
  - 配置后支持目录页面下新增删除文件(夹)

## v2.12.0
- 支持 `page` 相关配置
  - page_404
  - page_50x
  - page_dir
- 移除 `onDirectory` 配置

## v2.11.0
- 支持指定配置文件 命令 `f2e start -c [.f2econfig.js文件相对路径]`
- build模式对js、css后缀文件 不生效严重BUG修复
- 将服务初始化时机从 *首次接收到访问* 修改为 *启动时打开浏览器之前*

## v2.10.0
- 支持 `onServerCreate` 事件，可以在启动时接受 `server` 参数用于创建 Websocket等服务
- 修改支持 `no_host: true` 配置，端口服务单例化 （默认同一端口支持根据不同的host访问不同的配置服务）
- 添加启动参数判断， 当 `process.argv.includes('start')` 时，启动后打开浏览器

## v2.9.16
- `querystring.parse` 直接解析search参数 `+` 字符处理
- babel 中间件默认sourceMap配置项修改为false

## v2.9.4
- 支持 range 请求， 默认大小 1024 * 1024，支持配置参数 `range_size`
- 增加 ts 描述文档
