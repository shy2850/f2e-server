
const waitUtil = (util = () => true, times = 1800) => new Promise((resolve, reject) => {
    let i = 0
    let loop = function loop () {
        if (++i > times) {
            reject(new Error('wait-no-util error!'))
        } else if (util()) {
            resolve()
        } else {
            setTimeout(loop, 1000 / 60)
        }
    }
    loop()
})

module.exports = waitUtil
