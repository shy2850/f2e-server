import { IncomingMessage, ServerResponse, Server } from "http"
import { MemoryTree } from "memory-tree"
import * as net from 'net'
type LessConfig = any
type BabelConfig = any


export as namespace f2eserver;
export = f2eserver;

declare function f2eserver(conf: f2eserver.F2EConfig): void
declare namespace f2eserver {
    export interface F2Events {
        /**
         *  on request begin
         */
        beforeRoute?: {
            (pathname: string, req: IncomingMessage, resp: ServerResponse, mem?: MemoryTree.Store): string | false | undefined
        }
        /**
         * on request end
         */
        onRoute?: {
            (pathname: string, req: IncomingMessage, resp: ServerResponse, mem: MemoryTree.Store): string | false | undefined
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
            (pathname: string, data: MemoryTree.DataBuffer, store: MemoryTree.Store): MemoryTree.DataBuffer | Promise<{
                data: MemoryTree.DataBuffer;
                outputPath: string;
                originPath: string;
            }>
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
            (pathname: string, data: MemoryTree.DataBuffer, req: IncomingMessage, resp: ServerResponse, mem: MemoryTree.Store): MemoryTree.DataBuffer | false
        }
        /**
         * whether to build some path from disk
         */
        buildFilter?: {
            (pathname: string, data: MemoryTree.DataBuffer): boolean
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
        (conf: F2EConfig): Middleware
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

    export interface F2EConfig extends F2Events {
        root?: string
        port?: number
        host?: string
        /**
         * no host valid
         */
        no_host?: boolean
        livereload?: boolean
        build?: boolean
        gzip?: boolean
        /**
         * stream data output size per response
         */
        range_size?: number
        useLess?: boolean | LessConfig
        useBabel?: boolean | BabelConfig
        middlewares?: (MiddlewareCreater | MiddlewareRef)[]
        output?: string
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
         * pages config
         */
        page_404?: string | PageRender<{ pathname: string }>
        page_50x?: string | PageRender<{ error: Error }>
        page_dir?: string | PageRender<{ pathname: string, store: Object, conf: F2EConfig }>

        /**
         * 提供验证账户密码, 文件上传、删除等操作需要
         */
        authorization?: string
    }
}