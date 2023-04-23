import { IncomingMessage, ServerResponse } from "http"
import { F2EConfig, RequestWith } from 'f2e-server'
import { MemoryTree } from "memory-tree"

export interface ExecFn {
    (req: RequestWith, resp: ServerResponse, pathname?: string, memory?: MemoryTree.Store): any
}
export interface Callback<T = any> {
    (req?: RequestWith, resp?: ServerResponse, conf?: F2EConfig): T | Promise<T>
}
export interface BaseOutConfig extends Partial<F2EConfig> {
    interval?: number
    interval_beat?: number
}
export interface ExecOut {
    (fn: Callback, conf?: BaseOutConfig): ExecFn
}

export interface Out {
    Base: (type: string) => ExecOut
    JsonOut: ExecOut
    JsonpOut: ExecOut
    ServerSent: ExecOut
}

export class Route {
    execute: {
        (pathname: string, req: IncomingMessage, res: ServerResponse, memory?: MemoryTree.Store): any
    }
    on: {
        (reg: string | RegExp, exec: ExecFn): void
    }
    match: {
        (pathname: string): boolean
    }
}
export declare const out: Out
