import Component from './Component'
const toString = obj => {
    if (Array.isArray(obj)) {
        return obj.join('')
    } else {
        return obj.toString()
    }
}
const SELF_TAG = {
    input: !0,
    img: !0
}
const createStyle = styleObject => Object.keys(styleObject).map(k => {
    const v = styleObject[k]
    k = k.replace(/[A-Z]/g, c => '-' + c.toLocaleLowerCase())
    if (/width|height|left|top|bottom|right|padding|margin|border|size/i.test(k) && typeof v === 'number') {
        return k + ': ' + v + 'px'
    }
    return typeof v === 'undefined' ? '' : (k + ':' + v)
}).join(';')

const createNativeElement = (tag: string, {children, ...props}) => () => {
    let propsList = []
    for (let k in props) {
        const v = props[k]
        if (!v) {
            continue
        }
        switch (k) {
            case 'class':
            case 'className':
                propsList.push(` class="${v}"`)
                break
            case 'style':
                propsList.push(` style="${typeof v === 'string' ? v : createStyle(v)}"`)
                break
            default:
                propsList.push(` ${k}="${v}"`)
        }
    }
    if (SELF_TAG[tag]) {
        return `<${tag}${propsList.join('')}/>`
    } else {
        return `<${tag}${propsList.join('')}>${toString(children.map(c => toString(c)))}</${tag}>`
    }
}
const createElement = function createElement(nodeType: Function | string, props: any, ...children): ElementNode {
    let element
    const finalProps = {
        ...props,
        children
    }
    if (typeof nodeType === 'string') {
        element = createNativeElement(nodeType, finalProps)
    } else if (typeof nodeType === 'function') {
        element = nodeType
    } else {
        throw new Error('wrong Component')
    }
    return {
        nodeType,
        props,
        children,
        toString () {
            const isClass = !!element.prototype && element.prototype.construtor !== element
            if (isClass) {
                return toString(new element(props).render())
            } else {
                return toString(element(props))
            }
        }
    }
}

export default createElement