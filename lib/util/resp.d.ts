import { F2EConfig } from '../../index'

export interface RespUtil {
    handleError: (resp: ServerResponse, error: Error) => ServerResponse;
    handleSuccess: (req: IncomingMessage, resp: ServerResponse, pathname: string, data: string | Buffer) => ServerResponse;
    handleNotFound: (req: IncomingMessage, resp: ServerResponse, pathname: string) => ServerResponse;
    handleDirectory: (req: IncomingMessage, resp: ServerResponse, pathname: string, data: any) => void;
}

export = (conf: F2EConfig) => RespUtil