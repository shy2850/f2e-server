const conf = require('../conf/conf')({build: true})
const Middleware = require('../middleware/index')
const MemoryTree = require('memory-tree')
const emptyFn = () => console.log('build finished!')
module.exports = (callback = emptyFn, {watch, timeout}) => {
    const middleware = Middleware(conf)
    const memory = MemoryTree({
        onSet: middleware.onSet,
        onGet: middleware.onGet,
        buildWatcher: middleware.buildWatcher,
        buildFilter: middleware.buildFilter,
        outputFilter: middleware.outputFilter
    })
    if (conf.output) {
        memory.input(conf.root, watch).then(() => setTimeout(function () {
            memory.output(conf.output)
            callback()
        }, timeout || 1000))
    }
}
