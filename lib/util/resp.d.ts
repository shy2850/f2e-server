import { Stats } from 'fs'
import { ServerResponse, IncomingMessage } from 'http';
import { F2EConfig } from '../../index'

export interface RespUtil {
    handleError: (resp: ServerResponse, error: Error, req?: IncomingMessage) => ServerResponse;
    handleSuccess: (req: IncomingMessage, resp: ServerResponse, pathname?: string, data?: string | Buffer | Stats | MemoryTree.DataBuffer) => ServerResponse;
    handleNotFound: (req: IncomingMessage, resp: ServerResponse, pathname?: string) => ServerResponse;
    handleDirectory: (req: IncomingMessage, resp: ServerResponse, pathname: string, store: any) => string | false;
}

declare let mod: (conf: F2EConfig) => RespUtil
export = mod
