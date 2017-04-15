/*jshint esversion:6*/
const net = require('net');
const fs = require('fs');
const http = require('http');

const headers = [];
const server = http.createServer( (req, res) => {

  function generateResponse(file) {
    var fileData = '';
    return fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        notFound();
      } else {
        sendResponse(data);
      }
    });
  }

  function notFound() {
    fs.readFile('public/404.html', 'utf8', (err, data) => {
      if (err) {
        console.log(err);
      }
      sendResponse(data, 404);
    });
  }

  function sendResponse(data, status = 200) {
    res.writeHead(status, {
      'Content-Type'  : 'text/html',
      'Content-Length': data.length,
      'Date'          : new Date().toUTCString(),
      'Server'        : 'HackerSpace'
    });
    res.write(`${data}`);
    res.end();
  }

  const method = req.method;
  const httpVersion = 'HTTP' + req.httpVersion;
  let path = 'public' + req.url;

  if (path === 'public/') {
    path = 'public/index.html';
  }

  switch (method) {
    case 'GET': {
      generateResponse(path);
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

server.listen(8080);