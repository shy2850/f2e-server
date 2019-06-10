import { IncomingMessage, ServerResponse } from "http"
import { F2EConfig } from 'f2e-server'
import { MemoryTree } from "memory-tree"

export interface ExecFn {
    (req: IncomingMessage, resp: ServerResponse): string | false
}
export interface Callback<T extends Object = {}> {
    (req?: IncomingMessage, resp?: ServerResponse, conf?: F2EConfig): T | Promise<T>
}
export interface ExecOut {
    (fn: Callback, conf?: Partial<F2EConfig>): ExecFn
}

export interface ServerSentConfig extends Partial<F2EConfig> {
    interval?: number
}
export interface ServerSentOut {
    (fn: Callback, conf?: ServerSentConfig): ExecFn
} 

export interface Out {
    JsonOut: ExecOut,
    JsonpOut: ExecOut,
    ServerSent: ServerSentOut
}

export class Route {
    execute: {
        (pathname: string, req: IncomingMessage, res: ServerResponse, memory: MemoryTree.Store): string | false
    }
    on: {
        (reg: string | RegExp, exec: ExecFn): void
    }
}
export declare const out: Out
