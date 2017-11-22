import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as config from './config'
import { HashRouter as Router, Switch, Route, Link } from 'react-router-dom'

import ArticleListOfMenu from './containers/ArticleListOfMenu'
import ArticleListOfTag from './containers/ArticleListOfTag'

ReactDOM.render(
    <Router>
        <Switch>
            <Route path="/@:tag" component={ArticleListOfTag} />
            <Route path="/" component={ArticleListOfMenu} />
        </Switch>
    </Router>,
    document.getElementById('app')
)

