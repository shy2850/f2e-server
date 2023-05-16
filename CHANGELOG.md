# CHANGELOG

## v2.20.6
- 功能: 新增 `shouldUseCompressor` 过滤是否需要进行gzip等类型压缩的资源
- 修改: 内置请求扩展属性格式 `rawBody` 修改为 `Buffer`
- 修改: `max_body_parse_size` 修改为 `shouldUseBodyparser`
## v2.20.5
- 兼容修复: 代码方式配置仍然支持获取默认配置文件配置参数，优先级低于代码级别
## v2.20.3
- **重大修改**: 为了支持完整的代码方式配置，重构了config初始化和识别方式
## v2.20.2
- 配置修改: 修改配置文件检索方式，使用代码方式启动不再依赖配置文件，需要自己在入口完成所有配置
- 重构: 根据tslint错误重构压缩器和输出模块代码
- 修改: handleError支持参数request
- 修改: 移除 @types/node 开发依赖
- 修改: 代码方式启动后默认 livereload=false
- 修改: .d.ts 添加 open 参数，表示服务启动后打开浏览器, 等于命令行的 -O
## v2.19.3
- BUG & Feutre: 修改 `rename` 和 hash相关，所有资源均生成hash
## v2.19.2
- TypeScript: 修改 .d.ts 描述
## v2.19.1
- 功能: 删除keys目录，添加 `ssl_options` 支持手工配置ssl
- 配置: `ignore_events` 支持过滤掉watch文件修改事件
## v2.18.8
- Del: 删除创建APP的命令
- Del: 修改默认conf取消所有依赖
## v2.18.6
- TypeScript: 修改 .d.ts 描述
- esline: eslint 更新
## v2.18.5
- 功能: `rename` 支持修改所有资源名称
- 功能: `SetResult.end` 判断是否截断 `onSet` 操作链
## v2.18.3
- BUG: `namehash` 测试修改
- 修改: **onSet过程中如果修改输出路径直接跳出并返回结果**
## v2.18.0
- Del: 移除`bundles`相关内容
- 功能: 原来的`buildFilter`，拆分新增的`watchFilter`，原来`buildFilter`仅用于拦截编译
- 功能: 新增 `namehash` 功能，支持资源路径替换

## v2.17.5
- Deps: 锁定template中间件版本，并修改依赖
## v2.17.4
- TypeScript: onServerCreate 参数修复 http.Server
## v2.17.3
- TypeScript: 修改 .d.ts 描述
## v2.17.2
- Update: 更新依赖包，mime更新到3.0.0
## v2.17.1
- BUG: 压缩模块处理了非文本文件
## v2.17.0
- isText 全局整理
- uglify-es -> terser
- $include 不再支持压缩
## v2.16.17
- 功能: 新增配置 `compressors` 扩展gzip压缩方案
## v2.16.16
- BUG: `livereload` hide时候sse的undefined引用属性异常
## v2.16.15
- 新增参数`onContextReady`: 获取环境内主要对象
## v2.16.13
- memory-tree 更新
## v2.16.12
- types： watch参数暴露
## v2.16.11
- 编译依赖报错退出修改为 `error(exit 1)`
## v2.16.10
- 根据eslint格式修改优化
## v2.16.9
- livereload 优化： 根据文档 visibilitychange 事件修改 serversent 连接状态
## v2.16.8
- BUG：v2.16.7 版本 livereload组件修改 导致全局onText渲染错误
## v2.16.7
- 更新memory-tree版本到 0.6.18
- 修改livereload参数支持配置修改 `prefix` 和 `heartBeatTimeout`
## v2.16.6
- 更新less版本依赖到4.x
## v2.16.4
- middleware `try_files` 支持多目录的index
## v2.16.3
- middleware `try_files` 参数修改支持`location`
## v2.16.2
- middleware `try_files` 参数修改支持`replacer`
## v2.16.1
- middleware 所有事件均修改为支持Promise(有遗漏)
## v2.16.0
- ts 修改
- middleware 所有事件均修改为支持Promise

## v2.15.1
- renderHeader修改，区分文本类型再新增编码

## v2.15.0
- 配置文件错误时直接退出系统
- 新增`try_files`配置内置中间件，支持类似nginx的try_files配置

## v2.14.14
- types 修改
## v2.14.13
- BUG修复 mime判断 text 错写为 txt
## v2.14.12
- `req.data` 和 `req.post` 参数使用 `new URL().searchParams` 获取并转为 `NodeJS.Dict<string | string[]>`

## v2.14.10
- 静态服务路由支持过滤 `buildFilter`
- 静态服务路由修改 `onRoute` 为 `beforeRoute`

## v2.14.9
- 静态服务路由解析字符问题修改

## v2.14.8
- 静态服务APP恢复
- `url.parse` 修改为 `new URL`

## v2.14.6
- 默认目录配置修改

## v2.14.5
- 修改 files 配置，防止提交不需要的文件到npm仓库

## v2.14.4
- 修改参数 include 将 2.14.3 默认新增的 @import 去掉 【影响less编译】

## v2.14.3
- 修改参数 include 为RegExp[] 可以支持多组正则替换, 默认支持css @import

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
