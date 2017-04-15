/*jshint esversion:6*/
const net = require('net');
const fs = require('fs');
const http = require('http');

const headers = [];

const server = http.createServer( (req, res) => {

    const method = req.method;
    let path = req.url;
    const httpVersion = 'HTTP' + req.httpVersion;

    path = 'public' + path;

    if (path === 'public/') {
      path = 'public/index.html';
    }

    let response = null;

    if (method === "GET") {
      generateResponse(path);
    }

    function generateResponse(file) {
      var fileData = '';
      return fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
          console.log(err);
          return notFound();
        }
        sendResponse(data);
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
});

server.listen(8080);