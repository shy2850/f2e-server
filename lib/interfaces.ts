interface Component {
    props?
    state?
    render: Function
}
interface ElementNode {
    nodeType: Function | string
    props?: any
    children: ElementNode[] | string | null
    toString(): string
}
interface Menu {
    to: string
    title: string
    icon?: string
    color?: string
    children?: Menu[]
}

interface Article {
    title: string,
    pathname: string,
    keywords: string[]
    description: string,
    date: string
}
interface ArticleWithBody extends Article {
    body: string
}
type theme = "white" | "black" | "light" | "dark" | "primary" | "info" | "success" | "warning" | "danger"
interface Config {
    title: string
    keywords: string
    description: string
    theme: theme
    menus: Menu[]
    menuEnd: Menu[]
    tags: string[]
    articles: Article[]
}
