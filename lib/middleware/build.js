const MemoryTree = require('memory-tree')
const CleanCSS = require('clean-css')
const uglifyJs = require('uglify-js')
const _ = require('lodash')

const cleanCss = new CleanCSS({ compatibility: '*' })

module.exports = (conf, outputFilter) => {
    const {output, minify} = conf

    if (!output) {
        return
    }
    let treeCfg = {
        outputFilter
    }
    if (minify !== false) {
        treeCfg.onGet = (pathname, data) => {
            if (data.inlines && data.inlines.length) {
                console.log(data.inlines)
            } else if (pathname.match(/\.js$/)) {
                try {
                    return uglifyJs.minify(data.toString()).code || data
                } catch (e) {
                    return data
                }
            } else if (pathname.match(/\.css$/)) {
                return cleanCss.minify(data.toString()).styles || data
            } else {
                return data
            }
        }
    }
    const memoryTree = MemoryTree(treeCfg)
    return {
        onRoute (pathname, req, resp, memory) {
            if (pathname === '/server-build-output') {
                memoryTree.set(undefined, _.cloneDeep(memory.get()))
                memoryTree.output(output)
                .then(() => {
                    resp.end('build ok!')
                })
                .catch(e => {
                    resp.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'})
                    resp.end('<h2>build error!</h2><pre>' + JSON.stringify(e, 0, 2) + '</pre>')
                })
                return false
            }
        },
        onDirectory (pathname, items) {
            items.push({
                name: '&lt;构建输出&gt;',
                href: '/server-build-output'
            })
        }
    }
}
