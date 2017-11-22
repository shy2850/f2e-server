import React from '../react'
const Href = to => `/#${to}`
export default (props) => {
    const {
        theme,
        menus,
        menuEnd
    } = props

    return (
    <div className={`navbar is-${theme}`}>
        <div class="container">
            <div className="navbar-brand">
                    <a className="navbar-item" href={Href(menus.to)}>{menus.title}</a>
                <div className="navbar-burger burger" data-target="navbar-toggle-menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <div id="navbar-toggle-menu" className="navbar-menu">
                <div className="navbar-start">
                    {menus.children && menus.children.map(({ title, to, children }) => !children
                        ? <a class="navbar-item" href={Href(to)}>{title}</a>
                        : <div class="navbar-item has-dropdown is-hoverable">
                            <a class="navbar-link" href={Href(to)}>{title}</a>
                            <div className="navbar-dropdown">
                            {children.map(({ title, to }) => <a class="navbar-item" href={Href(to)}>{title}</a>)}
                            </div>
                        </div>)}
                </div>
                <div className="navbar-end">
                    <div className="navbar-item">
                        <div class="field is-grouped">
                            {menuEnd && menuEnd.map(({title, to, icon, color}) => <a class="navbar-item is-hidden-desktop-only" href={to} target="_blank">
                                <span class="icon" style={{color}} title={title}>
                                    <i class={`fa fa-lg fa-${icon}`}></i>
                                </span>
                            </a>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}
