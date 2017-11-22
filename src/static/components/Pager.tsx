import * as React from 'react'

const emptyFn = (page) => {}
export default ({
    theme = 'primary',
    onChange = emptyFn,
    current = 1,
    size = 10,
    total = 0
}) => {
    // 不需要分页
    if (total <= size) {
        return <div/>
    }

    const maxPage = Math.ceil(total / size)

    return <nav className="pagination" role="navigation" aria-label="pagination">
        <ul className="pagination-list">
            <li>
                <span className="pagination-link button" disabled={current === 1} onClick={e => onChange(--current)}>上一页</span>
            </li>
            <li>
                <span className={`pagination-link button is-${theme}`}>{current}</span>
            </li>
            <li>
                <span className="pagination-link button" disabled={current === maxPage} onClick={e => onChange(++current)}>下一页</span>
            </li>
        </ul>
    </nav>
}
