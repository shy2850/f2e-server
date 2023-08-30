import { IncomingMessage, ServerResponse } from "http"
import { F2EConfig, RequestWith } from 'f2e-server'
import { MemoryTree } from "memory-tree"

type onRoute = Required<F2EConfig>['onRoute']

export interface ExecFn<T extends object = any> {
    (req: RequestWith<T>, resp: ServerResponse, pathname?: string, memory?: MemoryTree.Store): ReturnType<onRoute>
}
export interface ServerAPI<T extends object = object, F = any> {
    (req: RequestWith<T>, resp: ServerResponse): F
}
export interface BaseOutConfig extends Partial<F2EConfig> {
    interval?: number
    interval_beat?: number
}
export interface ExecOut<T extends object = object, F = any> {
    (fn: ServerAPI<T, F>, conf?: BaseOutConfig): ExecFn<T>
}

export interface Out<T extends object = any> {
    Base: (type: string) => ExecOut<T>
    JsonOut: ExecOut<T>
    JsonpOut: ExecOut<T>
    ServerSent: ExecOut<T>
}

export class Route {
    execute: onRoute
    on: {
        (reg: string | RegExp, exec: ExecFn): void
    }
    match: {
        (pathname: string): boolean
    }
}
export declare const out: Out
