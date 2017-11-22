import * as path from 'path'
import marked from './marked'
import { readFileSync, writeFileSync } from 'fs'
import { createElement } from '../react'
import Body from '../components/Body'
import Article from '../components/Article'

export const source_path = 'src'
const CFG_PATH = path.join(__dirname, `../../${source_path}/config.json`)
let config: Config = require(CFG_PATH)
const { theme } = config
const Layout = readFileSync(path.join(__dirname, `../../${source_path}/layout.htm`)).toString()
const save = () => writeFileSync(CFG_PATH, JSON.stringify(config, null, 2))
export const getConfig = (): Config => config
export const renderHTML = html => Layout.replace(/\{\{(\w+)\}\}/g, (mat, k) => config[k] || mat)
.replace('{{body}}', createElement(Body, config).toString())
.replace('{{body}}', html)



const updateArticle = (article: Article) => {
    let {
        articles,
        tags
    } = config
    let find = articles.find(a => a.pathname === article.pathname)
    if (find) {
        Object.assign(find, article)
    } else {
        articles.unshift(article)
    }
    let tagsMap = {}
    tags.map(tag => {
        tagsMap[tag] = !0
    })
    article.keywords.map(tag => {
        if (!tagsMap[tag]) {
            tags.unshift(tag)
        }
    })
    save()
}




export const renderMD = (({map, model}) => (md, pathname) => {
    let cfg: Article = {
        title: '',
        pathname,
        keywords: [],
        description: '',
        date: ''
    }
    md = md.replace(/(?:(\n|^))(\w+):([^\r\n]+)/g, (line, temp, key, value) => {
        if (map[key]) {
            cfg[key] = map[key](value.trim())
            return ''
        } else {
            return line
        }
    })
    let errMsg = ''
    if (!cfg.title || !cfg.date) {
        errMsg = `<script>alert('文章缺少标题或者创建日期,请在文档头部添加\n${model}')</script>`
    }
    updateArticle(cfg)
    const baseContent = createElement(Article, { theme, article: Object.assign({ body: marked(md) }, cfg)}).toString()
    const content = createElement(Body, Object.assign({}, config, cfg)).toString().replace('{{body}}', baseContent)
    return Layout.replace(/\{\{(\w+)\}\}/g, (mat, k) => cfg[k] || mat).replace('{{body}}', errMsg + content)
})({
    map: {
        title: n => n,
        keywords: k => k.match(/[^\s,"'./\\!@#$%\^&*()<>?+]+/g),
        description: d => d,
        date: d => d
    },
    model: 'title: f2e-blog 脚手架  \\nkeywords: f2e-blog, 博客, 文档  \\ndescription: 使用 f2e-blog 逐步完成个人博客环境搭建  \\ndate: 2017/11/16'
})
