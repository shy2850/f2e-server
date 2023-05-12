const Middleware = require('../middleware/index')
const MemoryTree = require('memory-tree').default
const emptyFn = () => console.log('build finished!')

module.exports = (callback = emptyFn, opt = {watch: 0, timeout: 1000}) => {
    const conf = require('../conf/conf')({build: true})
    const middleware = Middleware(conf)
    const memory = MemoryTree({
        root: conf.root,
        watch: !!opt.watch,
        dest: conf.output,
        onSet: middleware.onSet,
        onGet: middleware.onGet,
        buildWatcher: (pathname, type, build) => {
            middleware.buildWatcher(pathname, type, build)
            memory.store.onBuildingChange(function (building) {
                if (!build) {
                    memory.output('')
                }
            })
        },
        buildFilter: middleware.buildFilter,
        outputFilter: middleware.outputFilter
    })
    if (conf.output) {
        memory.input('').then(() => {
            memory.output('')
        }).catch(err => console.trace(err))
    }
}
