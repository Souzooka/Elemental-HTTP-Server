/*jshint esversion:6*/
function requestHandler(req, res) {
  const querystring = require('querystring');
  const getHandler = require('./getHandler.js');
  const postHandler = require('./postHandler.js');
  const putHandler = require('./putHandler.js');
  const deleteHandler = require('./deleteHandler.js');
  const basicAuth = require('./basicAuth.js');

  const method = req.method;
  let body = [];

  req.on('data', function(chunk) {
    body.push(chunk);
  });

  req.on('end', () => {
    body = querystring.parse(Buffer.concat(body).toString());

    switch (method) {
      case 'GET': {
        getHandler(req, res);
        break;
      }
      case 'POST': {
        if (basicAuth(req, res).isAuthorized()) {
          postHandler(req, res, body);
        }
        break;
      }
      case 'PUT': {
        if (basicAuth(req, res).isAuthorized()) {
          putHandler(req, res, body);
        }
        break;
      }
      case 'DELETE': {
        if (basicAuth(req, res).isAuthorized()) {
          deleteHandler(req, res, body);
        }
        break;
      }
      case 'HEAD': {
        res.writeHead(200, {
          'Date'          : new Date().toUTCString(),
          'Server'        : 'HackerSpace'
        });
        res.end();
        break;
      }
      case 'OPTIONS': {
        res.writeHead(200, {
          'Date'          : new Date().toUTCString(),
          'Server'        : 'HackerSpace'
        });
        res.write('GET, POST, PUT, DELETE, HEAD');
        res.end();
        break;
      }
    }
  });
}

module.exports = requestHandler;