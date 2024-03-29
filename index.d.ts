import { IncomingMessage, ServerResponse, OutgoingHttpHeaders, Server } from "http"
import type * as https from 'https'
import { MemoryTree } from "memory-tree"
import { CompressorType } from "./lib/util/compressor"
type LessConfig = Less.Options

declare function f2eserver(...conf: f2eserver.F2EConfig[]): void
declare namespace f2eserver {
    export interface RequestWith<T extends object = any> extends IncomingMessage {
        /**
         * 请求search参数
         */
        data: Record<keyof T, string | string[]>,
        /**
         * 原始请求内容
         */
        rawBody?: Buffer,
        /**
         * POST请求为 application/json 类型时，转换后的参数
         * 如果不转JSON或者转换失败, 转为utf8编码的字符串
         */
        body?: T extends object ? T : string,
        /**
         * POST请求为 application/x-www-form-urlencoded 类型时，转化后的参数
         * @description <b>不支持文件上传</b>
         */
        post?: Record<keyof T, string | string[]>,
    }
    export type SetResult = MemoryTree.DataBuffer | {
        data: MemoryTree.DataBuffer;
        /** 源文件路径 */
        originPath?: string;
        /** 修改后路径 */
        outputPath?: string;
        /** 结束操作链返回当前结果 */
        end?: boolean;
    }
    export interface F2Events {
        /**
         *  on request begin
         */
        beforeRoute?: {
            (pathname: string, req: IncomingMessage, resp: ServerResponse, conf?: F2EConfig): string | false | void | Promise<string | false | void>
        }
        /**
         * on request end
         */
        onRoute?: {
            <T extends object>(pathname: string, req: RequestWith<T>, resp: ServerResponse, store?: MemoryTree.Store): string | false | void | Promise<string | false | void>
        }
        /**
         * on file change
         */
        buildWatcher?: {
            (pathname: string, eventType: string, build: MemoryTree.Build, store: MemoryTree.Store): void
        }
        /**
         * on data save into memory
         */
        onSet?: {
            (pathname: string, data: MemoryTree.DataBuffer, store: MemoryTree.Store): SetResult | Promise<SetResult>
        }
        /**
         * get data from memory
         */
        onGet?: {
            (pathname: string, data: MemoryTree.DataBuffer, store: MemoryTree.Store, input_output_map: Map<string, {
                output: string,
                hash: string,
            }>): MemoryTree.DataBuffer | Promise<MemoryTree.DataBuffer>
        }
        /**
         * if text on request
         */
        onText?: {
            (pathname: string, data: MemoryTree.DataBuffer, req: IncomingMessage, resp: ServerResponse, store: MemoryTree.Store): MemoryTree.DataBuffer | false | Promise<MemoryTree.DataBuffer | false>
        }
        /**
         * whether to watch some path from disk
         */
        watchFilter?: {
            (pathname: string): boolean
        }
        /**
         * whether to build some path from disk
         */
        buildFilter?: {
            (pathname: string): boolean
        }
        /**
         * whether to persist data by outputPath
         */
        outputFilter?: {
            (pathname: string, data: MemoryTree.DataBuffer): boolean
        }
    }
    export interface Middleware extends F2Events {
        /**
         * turn of middle to execute
         */
        setBefore?: number
    }
    export interface MiddlewareCreater {
        (conf: Required<F2EConfig>, options?: any): Middleware | undefined | null
    }
    export interface MiddlewareRef {
        /**
         * middleware name
         * > if you middleware named `f2e-middle-markdown` then use 'markdown' here
         * > ## middleware should implements MiddlewareCreater
         */
        middleware: string
        /**
         * turn of middle to execute
         */
        setBefore?: number
        /**
         * support muti options for any middlewares
         */
        [x: string]: any
    }

    export interface PageRender<T = any, R = string> {
        (req: IncomingMessage, resp: ServerResponse, data: T): R
    }

    export type TryFilesItem = {
        test: RegExp,
        replacer?: string | { (m: string, ...args: any[]): string },
    } & (
            { index: string | { (pathname: string, req: IncomingMessage, resp: ServerResponse): string } }
            | { location: string | { (pathname: string, req: IncomingMessage, resp: ServerResponse): string } }
        )

    export interface LiveReloadConfig {
        prefix?: string
        publicPath?: string
        heartBeatTimeout?: number
    }
    export interface F2EConfig extends F2Events {
        /** 项目根路径 */
        root?: string
        /** 默认从2850开始找未使用的端口， 配置后不检测,
         * 当配置端口为443的时候自动转化为 https 服务并需要配置 ssl_options */
        port?: number
        /** 是否打开浏览器, 依赖本地命令 open 打开 */
        open?: boolean
        /**
         * ssl 配置
         * 如: { key: string, cert: string }
         * */
        ssl_options?: https.ServerOptions
        /**
         * 指定host访问生效
         * 未指定时，只要是访问端口符合就可以，相当于nginx的 servername: _
         */
        host?: string
        /** 开启监听文件修改 */
        watch?: boolean
        /**
         * 忽略文件更新事件
         * @default ['add', 'addDir']
         */
        ignore_events?: ("add" | "addDir" | "change" | "unlink" | "unlinkDir")[]
        /** 开启监听文件修改，并植入sse监测脚本 */
        livereload?: boolean | LiveReloadConfig
        build?: boolean
        gzip?: boolean
        /** gzip 压缩扩展，支持更多压缩方式 */
        compressors?: CompressorType[]
        /**
         * 运行时 是否对资源进行 gzip等压缩
         * 可以根据文件路径、文件大小给出结果
         * @default function (pathname, min_size) { return isText(pathname) && min_size > 4096 }
         * @param  {string} pathname 资源路径名
         * @param  {number} data 资源大小
         * @return {boolean}
         */
        shouldUseCompressor?: (pathname: string, min_size: number) => boolean
        /**
         * build 阶段是否使用 terser/uglify/cleanCSS 进行 minify 操作
         * 可以根据文件路径或者文件内容、大小给出结果
         * @default function () { return true }
         * @param  {string} pathname 资源路径名
         * @param  {MemoryTree.DataBuffer} data     资源内容
         * @return {boolean}
         */
        shouldUseMinify?: (pathname: string, data: MemoryTree.DataBuffer) => boolean
        /**
         * post是否进行请求参数封装
         *   1. 请求头JSON格式， 会执行JSON.parse并将结果赋值于 request.body 上，
         *   2. 请求头非JSON，会执行表单反序列化转化成对象将结果赋值于 request.post 上
         *   3. 不封装时，request.rawBody 为原始请求数据， request.body 为原始数据转 utf8 格式字符串
         * @default function (pathname, max_size) { return min_size < 100 * 4096 }
         * @param {string} pathname 请求路径
         * @param {number} max_size 请求内容大小
         * @returns
         */
        shouUseBodyParser?: (pathname: string, max_size: number) => boolean
        /**
         * stream data output size per response
         */
        range_size?: number
        useLess?: boolean | LessConfig
        /**
         * 启用babel时候是否
         */
        sourceMap?: boolean

        /**
         * @default [/\$include\[["'\s]*([^"'\s]+)["'\s]*\](?:\[["'\s]*([^"'\s]+)["'\s]*\])?/g]
         */
        include?: RegExp[]
        /**
         * @default /^@import["'\s]+(.+)["'\s]+;?$/
         */
        css_import?: RegExp
        /**
         * @default /\$belong\[["'\s]*([^"'\s]+)["'\s]*\]/
         */
        belong?: RegExp
        /**
         * @default "$[placeholder]"
         */
        placeholder?: string

        /**
         * 通过文件名判断是否文本资源, 用于include模块扩展mime
         */
        isText?: (pathname: string) => boolean

        middlewares?: (MiddlewareCreater | MiddlewareRef)[]
        output?: string
        /**
         * after server create
         * you can render websocket server via this
         */
        onServerCreate?: (server: Server, conf: F2EConfig) => void
        /** 获取环境上下文信息 */
        onContextReady?: (context: { middleware: Middleware, memory: MemoryTree.MemoryTree }) => void
        /**
         * init urls on server start
         */
        init_urls?: string[]

        /**
         * 运行时添加(中间件中随时添加)，源文件读取，不编译、不输出
         * @readonly
         */
        __ignores__?: Set<string>
        /**
         * 输出所有资源编译信息
         */
        __withlog__?: boolean
        /**
         * pages config
         */
        page_init?: string
        page_404?: string | PageRender<{ pathname: string }>
        page_50x?: string | PageRender<{ error: Error }>
        page_dir?: string | PageRender<{ pathname: string, dirname: string, store: Object, conf: F2EConfig }>
        /**
         * 所有响应附加响应头信息
         */
        renderHeaders?: { (headers: OutgoingHttpHeaders, req?: IncomingMessage): OutgoingHttpHeaders }
        /**
         * 提供验证账户密码, 文件上传、删除等操作需要
         */
        authorization?: string

        /**
         * 自定义全局解析器，默认'memory-tree'，不要修改，除非你只打算使用host识别的功能
         * @deprecated
         */
        app?: 'memory-tree' | {
            (conf: F2EConfig): ((req: IncomingMessage, resp: ServerResponse) => void) | Promise<(req: IncomingMessage, resp: ServerResponse) => void>
        },

        /**
         * 参考Nginx配置 `try_files` 而产生的功能 (`querystring`已经解析到`req.data`中)
         * 1. 类型为`string`时, 所有未能找到资源的情况都转发到这个 `pathname`
         * 2. 类型为`{test, exec}[]`, 依次循环匹配`test`, 进行转发
         */
        try_files?: string | TryFilesItem[]

        /**
         * 统一修改资源名称
         * @default `(oldname) => oldname`
         */
        rename?: (oldname: string, hash: string) => string
        /**
         * 资源引用修改名称
         */
        namehash?: {
            /**
             * 要处理的入口文件
             * @default ["index\\.html$"]
            */
            entries?: string[]
            /**
             * 替换src的正则
             * @default ['\\s(?:=href|src)="([^"]*?)"']
             */
            searchValue?: string[]
            /**
             * 默认返回 `${output}?${hash}`
             * @param output 替换后的文件名
             * @param hash 文件摘要md5
             * @returns 字符串
             *
             */
            replacer?: (output: string, hash?: string) => string
        }
    }
}
export = f2eserver;
