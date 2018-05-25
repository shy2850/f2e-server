const test = (reg, str) => {
    if (reg instanceof RegExp) {
        return reg.test(str)
    } else {
        return reg === str
    }
}
module.exports = class {
    constructor () {
        this.routes = []
        this.execute = this.execute.bind(this)
        this.on = this.on.bind(this)
    }
    execute (pathname, req, resp, memory) {
        const {routes} = this
        let matches = false
        for (let i = 0; i < routes.length; i++) {
            const route = routes[i]
            if (test(route.reg, pathname)) {
                matches = true
                const res = route.exec(req, resp)
                if (typeof res !== 'undefined') {
                    return res
                }
            }
        }
        if (matches) {
            return false
        }
    }
    on (reg, exec) {
        this.routes.push({reg, exec})
    }
}
