const mime = require('mime')

exports.handleError = (resp, error) => {
    resp.writeHead(500, {
        'Content-Type': 'text/html'
    })
    resp.end(JSON.stringify(error))
    return resp
}

exports.handleSuccess = (resp, pathname) => {
    resp.writeHead(200, {
        'Content-Type': mime.lookup(pathname) || 'text/html'
    })
    return resp
}

exports.handleNotFound = (resp, pathname) => {
    resp.writeHead(404, {
        'Content-Type': 'text/html'
    })
    resp.end('<meta charset="utf-8"/>' +
        '<h2 style="text-align: center"> 404: <small>"' + pathname + '"</small>  is gone!</h2>')
    return resp
}
