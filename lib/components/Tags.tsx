import React from '../react'
export const Tags = ({ tags, className = '', theme = 'primary' }) => <div className={`${className} tags`}>
    {tags && tags.map(tag => <a href={`/#@${tag}`} className={`tag is-${theme}`}>{tag}</a>)}
</div>
export const AddonsTag = ({ tag, count, className = '', theme = 'primary' }) => <div className={`${className} control`}>
    <a href={`/#@${tag}`} className={`tags has-addons`}>
        <span class={`tag is-${theme}`}>{tag}</span>
        <span class="tag">{count|0}</span>
    </a>
</div>

export default ({ tags = [], className, theme = 'primary', tagCount }) => <div className={`${className} panel`}>
    <p className="panel-heading">
        所有标签
    </p>
    {tagCount
        ? <div className="panel-block">
            <div className="field is-grouped is-grouped-multiline">
                {tags.map(tag => <AddonsTag tag={tag} count={tagCount[tag]} theme={theme}/>)}
            </div>
        </div>
        : <Tags tags={tags} className="panel-block" theme={theme} />}

</div>

