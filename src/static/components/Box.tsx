import * as React from 'react'
export default ({
    title,
    keywords,
    pathname,
    theme = 'primary',
    description
}) => <div className="box">
        <article className="media">
            <div className="media-content">
                <div className="content" style={{cursor: 'pointer'}}>
                    <h4 onClick={e => { location.href = pathname }}>{title}</h4>
                    <p onClick={e => { location.href = pathname }}>{description}</p>
                    <div className="tags">
                        {keywords && keywords.map(tag => <a href={`/#@${tag}`} className={`tag is-${theme}`}>{tag}</a>)}
                    </div>
                </div>
            </div>
        </article>
    </div>
