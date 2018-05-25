import { IncomingMessage, ServerResponse } from "http"
import { F2EConfig } from 'f2e-server'
import "memory-tree"

export interface ExecFn {
    (req: IncomingMessage, resp: ServerResponse): any | Promise<any>
}
export interface Callback {
    (req?: IncomingMessage, resp?: ServerResponse, conf?: F2EConfig): any | Promise<any>
}
export interface ExecOut {
    (fn: Callback, conf?: F2EConfig): ExecFn
}

export interface Out {
    JsonOut: ExecOut,
    JsonpOut: ExecOut,
    ServerSent: ExecOut
}

export class Route {
    execute: {
        (pathname: string, req: IncomingMessage, res: ServerResponse, memory: MemoryTree.Store): false | string
    }
    on: {
        (reg: string | RegExp, exec): void
    }
}
export declare const out: Out
