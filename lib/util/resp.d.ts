import { Stats } from 'fs'
import { F2EConfig } from '../../index'

export interface RespUtil {
    handleError: (resp: ServerResponse, error: Error) => ServerResponse;
    handleSuccess: (req: IncomingMessage, resp: ServerResponse, pathname?: string, data?: string | Buffer | Stats) => ServerResponse;
    handleNotFound: (req: IncomingMessage, resp: ServerResponse, pathname?: string) => ServerResponse;
    handleDirectory: (req: IncomingMessage, resp: ServerResponse, pathname: string, store: any) => string | false;
}

let mod: (conf: F2EConfig) => RespUtil
export = mod