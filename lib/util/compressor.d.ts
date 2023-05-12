import { Transform } from "stream";
import { InputType } from "zlib";
import { IncomingMessage } from 'http';
import { F2EConfig } from '../../index'

export interface Compressor<E extends string = string> {
    createStream: () => Transform,
    compressSync: (buf: InputType) => Buffer,
    contentEncoding: E
}

export type PredefinedCompressorType = 'br' | 'gzip' | 'deflate'

export type CompressorType = Compressor | PredefinedCompressorType

export type PredefinedCompressors = Record<PredefinedCompressorType,Compressor>

declare const predefinedCompressors: PredefinedCompressors
declare const getCompressor: (req: IncomingMessage, conf: F2EConfig) => Compressor
export { predefinedCompressors, getCompressor }
