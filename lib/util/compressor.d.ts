import { Transform } from "stream";
import { InputType } from "zlib";

export interface Compressor<E extends string = string> {
    createStream: () => Transform,
    compressSync: (buf: InputType) => Buffer,
    contentEncoding: E
}

export type PredefinedCompressorType = 'br' | 'gzip' | 'deflate'

export type CompressorType = Compressor | PredefinedCompressorType

export type PredefinedCompressors = {
    [k in PredefinedCompressorType]: Compressor<k>
}
