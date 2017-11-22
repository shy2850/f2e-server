import React from '../react'
import { Tags } from './Tags'
export default ({
    article,
    theme = 'primary'
}) => <div className="content">
    <section className={`hero is-${theme}`}>
        <div className="hero-body">
            <h1 className="title">
                {article.title}
            </h1>
            <h2 className="subtitle">
                {article.description}
            </h2>
            <p>{article.date}</p>
        </div>
    </section>
    {article.body}
    <Tags tags= { article.keywords } theme={theme}/>
</div>
