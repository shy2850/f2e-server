const fs = require('fs')
const url = require('url')
const {
    handleError,
    handleSuccess
} = require('../util/resp')

exports.resolve = (resp, pathname, location, conf) =>
    fs.readdir(pathname, (error, files) => {
        const base = (location.pathname + '/').replace(/\/+/g, '/')
        if (error) {
            handleError(resp, error)
        } else {
            let items = ['../'].concat(files.filter(n => !n.match(/^\./)))
            let html = items
                .map(name => '<a href="' + url.resolve(base, name) + '">'  + name + '</a>')
                .join('</li><li>')
            handleSuccess(resp, 'html').end('<meta charset="utf-8"/> <ul><li>' + html + '</li></ul>')
        }
    })
