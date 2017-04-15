/*jshint esversion:6*/
const net = require('net');
const fs = require('fs');

const headers = [];

const server = net.createServer( (c) => {

  c.on('data', (data) => {
    const header = data.toString().split('\r\n');
    const requestLine = header[0].split(' ');

    const method = requestLine[0];
    let path = requestLine[1];
    const httpVersion = requestLine[2];

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
        sendResponse(data, '404 NOT FOUND');
      });
    }

    function sendResponse(data, status = '200 OK') {
      c.write(`HTTP/1.1 ${status}
Content-Type : text/html
Content-Length: ${data.length}
Date: ${new Date().toUTCString()}
Server: HackerSpace

${data}`);
      c.end();
    }
  });
});

server.listen(8080);