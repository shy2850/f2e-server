import * as marked from 'marked'
import * as highlight from 'highlight.js'

marked.setOptions({
    highlight: function (code) {
        return highlight.highlightAuto(code).value
    }
})
export default (md: string) => marked(md)