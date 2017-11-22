import React from '../react'
import Navbar from './Navbar'
import Footer from './Footer'
import Tags from './Tags'

let tagCount
export default class extends React.Component {
    getTagCount () {
        const tags: string[] = this.props.tags
        const articles: Article[] = this.props.articles
        let map = {}
        tags.map(t => {
            map[t] = 0
        })
        articles.map(({ keywords }) => keywords.map(key => map[key]++))
        return map
    }
    render () {
        const { theme, menus, menuEnd, tags, body = '{{body}}' } = this.props
        tagCount = tagCount || this.getTagCount()
        return <div>
            <Navbar theme={theme} menus={menus} menuEnd={menuEnd} />
            <div className="section container" style={{ minHeight: '80vh' }}>
                <div className="columns">
                    <div className="column is-four-fifths">{body}</div>
                    <Tags className="column" tags={tags} theme={theme} tagCount={tagCount}/>
                </div>
            </div>
            <Footer />
        </div>
    }
}
