
const waitUtil = (util = () => true, times = 1800) => new Promise((resolve, reject) => {
    let i = 0
    let loop = function loop () {
        if (++i > times) {
            reject(new Error('wait-no-util error!'))
        } else if (util()) {
            resolve()
        } else {
            setTimeout(loop, 500)
        }
    }
    setTimeout(loop, 300)
})

module.exports = waitUtil
