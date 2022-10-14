import { IncomingMessage, ServerResponse, OutgoingHttpHeaders } from "http"
import { MemoryTree } from "memory-tree"
import * as net from 'net'
type LessConfig = Less.Options

declare function f2eserver(conf: f2eserver.F2EConfig): void
declare namespace f2eserver {
    export interface RequestWith<T = any> extends IncomingMessage {
        data: T,
        body?: T,
        rawBody?: Uint8Array[],
        post?: T
    }
    export type SetResult = MemoryTree.DataBuffer | {
        data: MemoryTree.DataBuffer;
        outputPath?: string;
        originPath?: string;
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
            (pathname: string, req: IncomingMessage, resp: ServerResponse, mem?: MemoryTree.Store): string | false | void | Promise<string | false | void>
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
            (pathname: string, data: MemoryTree.DataBuffer, store: MemoryTree.Store): MemoryTree.DataBuffer | Promise<MemoryTree.DataBuffer>
        }
        /**
         * if text
         */
        onText?: {
            (pathname: string, data: MemoryTree.DataBuffer, req: IncomingMessage, resp: ServerResponse, mem: MemoryTree.Store): MemoryTree.DataBuffer | false | Promise<MemoryTree.DataBuffer | false>
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
        replacer?: string | {(m: string, ...args: any[]): string},
    } & (
        { index: string | {(...args: Parameters<F2EConfig['onRoute']>): string} }
        | { location: string | {(...args: Parameters<F2EConfig['onRoute']>): string} }
    )

    export interface LiveReloadConfig {
        prefix?: string
        publicPath?: string
        heartBeatTimeout?: number
    }
    export interface F2EConfig extends F2Events {
        watch?: boolean
        root?: string
        port?: number
        host?: string
        /**
         * no host valid
         */
        no_host?: boolean
        livereload?: boolean | LiveReloadConfig
        build?: boolean
        gzip?: boolean
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
         * 简单打包模式, 会把依赖的文件无序的合并到目标文件中
         * 不支持sourcemap
         */
        bundles?: {
            /** 用一个正则匹配到所有需要合并的文件列表 */
            test: RegExp
            /** 目标文件完整路径, 必须在项目中存在 */
            dist: string
        }[]

        /**
         * 使用 bundles 模式打包amd模块时，支持根据文件路径设置 模块ID
         */
        getModuleId?: (pathname: string) => string

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
         * build 阶段是否使用 uglify/cleanCSS 进行 minify 操作
         * 可以根据文件路径或者文件内容、大小给出结果
         * @param  {string} pathname 资源路径名
         * @param  {MemoryTree.DataBuffer} data     资源内容
         * @return {boolean}
         */
        shouldUseMinify?: (pathname: string, data: MemoryTree.DataBuffer) => boolean
        /**
         * after server create
         * you can render websocket server via this
         */
        onServerCreate?: (server: net.Server) => void
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
        page_404?: string | PageRender<{ pathname: string }>
        page_50x?: string | PageRender<{ error: Error }>
        page_dir?: string | PageRender<{ pathname: string, dirname: string, store: Object, conf: F2EConfig }>

        /**
         * 请求body转化为UTF8字符串长度 小于100K时候进行 parse
         */
        max_body_parse_size?: number
        /**
         * 所有响应附加响应头信息
         */
        renderHeaders?: { (headers: OutgoingHttpHeaders, req?: IncomingMessage): OutgoingHttpHeaders }
        /**
         * 提供验证账户密码, 文件上传、删除等操作需要
         */
        authorization?: string

        /**
         * 自定义全局解析器
         */
        app?: 'static' | 'memory-tree' | {
            (conf: F2EConfig): (req: IncomingMessage, resp: ServerResponse) => void
        },

        /**
         * 参考Nginx配置 `try_files` 而产生的功能 (`querystring`已经解析到`req.data`中)
         * 1. 类型为`string`时, 所有未能找到资源的情况都转发到这个 `pathname`
         * 2. 类型为`{test, exec}[]`, 依次循环匹配`test`, 进行转发
         */
        try_files?: string | TryFilesItem[]
    }
}
export = f2eserver;
