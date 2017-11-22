import * as React from 'react'
import Box from '../components/Box'
import Pager from '../components/Pager'
import * as config from '../config'

const { articles = [], theme } = config
class List extends React.Component {
    state
    props
    setState
    constructor(props) {
        super(props)
        this.state = {
            size: 5,
            page: 1
        }
    }
    filterArticles() {
        // react-router-dom props
        const {
            match: {
                params: {
                    tag
                }
            }
        } = this.props
        return articles.filter((article) => ~article.keywords.indexOf(tag))
    }
    changePage(page) {
        this.setState({ page })
    }
    render() {
        const list = this.filterArticles()
        const { size, page } = this.state
        const min = size * (page - 1)
        const max = size * page
        return list.length ? <div>
            {list.slice(min, max).map((item, i) => <Box key={item.pathname} theme={theme} {...item} />)}
            <Pager current={page} size={size} total={list.length} onChange={this.changePage.bind(this)} />
        </div> : <h2 style={{ textAlign: 'center' }}>该标签还没有文章！</h2>
    }
}
export default List
