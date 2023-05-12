// @ts-check

const zlib = require('zlib')

/**
 * @type {import('./compressor').PredefinedCompressors}
 */
const predefinedCompressors = {
    br: {
        createStream: zlib.createBrotliCompress,
        compressSync: zlib.brotliCompressSync,
        contentEncoding: 'br'
    },
    gzip: {
        createStream: zlib.createGzip,
        compressSync: zlib.gzipSync,
        contentEncoding: 'gzip'
    },
    deflate: {
        createStream: zlib.createDeflate,
        compressSync: zlib.deflateSync,
        contentEncoding: 'deflate'
    }
}

/**
 * Get the most suitable compression algorithm for the given request
 * @param {import('http').IncomingMessage} req
 * @param {import('../../index').F2EConfig} conf
 * @return {import('./compressor').Compressor?}
 */
const getCompressor = (req, conf) => {
    let { gzip, compressors } = conf
    const encodingStr = req.headers['accept-encoding'] ? req.headers['accept-encoding'].toString() : ''
    const encodings = encodingStr.split(/, ?/).map(x => x.split(';')[0])
    const _compressors = compressors ? compressors.map(x => {
        if (typeof x === 'string') {
            return predefinedCompressors[x]
        } else {
            return x
        }
    }) : []
    if (gzip) {
        _compressors.push(predefinedCompressors.gzip)
    }
    for (const compressor of _compressors) {
        if (encodings.includes(compressor.contentEncoding)) {
            return compressor
        }
    }
    return null
}

module.exports = { predefinedCompressors, getCompressor }
