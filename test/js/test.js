$include['lodash.js'];

console.log(_.keys)
let min = 1

setInterval(e => {
    document.querySelector('h2').innerHTML = min++
}, 300)
