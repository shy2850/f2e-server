$include['lodash.js'];

console.log(_.keys)
let min = 1

setInterval(e => {
    document.querySelector('h2').innerHTML = min++
}, 300)

fetch(new Request('./widget/table.html', {
    headers: {'x-requested-with': 'XMLHttpRequest'}
})).then(res => res.text()).then(html => {
    console.log(html)
})
