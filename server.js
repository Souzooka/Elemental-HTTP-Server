/*jshint esversion:6*/
const net = require('net');
const fs = require('fs');
const http = require('http');
const querystring = require('querystring');

const headers = [];
const server = http.createServer( (req, res) => {

  function generateGETResponse(file) {
    var fileData = '';
    return fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        notFound();
      } else {
        sendGETResponse(data);
      }
    });
  }

  function notFound() {
    fs.readFile('public/404.html', 'utf8', (err, data) => {
      if (err) {
        console.log(err);
      }
      sendGETResponse(data, 404);
    });
  }

  function sendGETResponse(data, status = 200) {
    res.writeHead(status, {
      'Content-Type'  : 'text/html',
      'Content-Length': data.length,
      'Date'          : new Date().toUTCString(),
      'Server'        : 'HackerSpace'
    });
    res.write(`${data}`);
    res.end();
  }

  function createFile(filepath, data) {

  }

  const method = req.method;
  const httpVersion = 'HTTP' + req.httpVersion;
  var body = [];


  let path = 'public' + req.url;

  if (path === 'public/') {
    path = 'public/index.html';
  }

  req.on('error', function(err) {
    console.error(err);
  });

  req.on('data', function(chunk) {
    body.push(chunk);
  });

  req.on('end', () => {
    body = querystring.parse(Buffer.concat(body).toString());
    switch (method) {
      case 'GET': {
        generateGETResponse(path);
        break;
      }
      case 'POST': {
        console.log(body);
        break;
      }
      case 'OPTIONS': {
        res.writeHead(200);
        res.write('GET, POST, PUT, DELETE, HEADERS');
        res.end();
        break;
      }
    }
  });
});

server.listen(8080);