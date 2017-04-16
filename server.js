/*jshint esversion:6*/
const net = require('net');
const fs = require('fs');
const http = require('http');
const querystring = require('querystring');

const headers = [];
let elements = 2;
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

  function postFile(body) {
    const fileData = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - ${body.elementName.charAt(0).toUpperCase() + body.elementName.slice(1)}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <h1>${body.elementName.charAt(0).toUpperCase() + body.elementName.slice(1)}</h1>
  <h2>${body.elementSymbol}</h2>
  <h3>Atomic number ${body.elementAtomicNumber}</h3>
  <p>${body.elementDescription}</p>
  <p><a href="/">back</a></p>
</body>
</html>`;
    const fileName = `public/${body.elementName}.html`;
    fs.access(fileName, fs.constants.F_OK, (err) => {
      if (err) {
        writeNewFile(fileName, fileData);
      } else {
        res.writeHead(409);
        res.write('File already exists on server.');
        res.end();
      }
    });
  }

  function putFile(body) {
    console.log('test')
    const fileData = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - ${body.elementName.charAt(0).toUpperCase() + body.elementName.slice(1)}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <h1>${body.elementName.charAt(0).toUpperCase() + body.elementName.slice(1)}</h1>
  <h2>${body.elementSymbol}</h2>
  <h3>Atomic number ${body.elementAtomicNumber}</h3>
  <p>${body.elementDescription}</p>
  <p><a href="/">back</a></p>
</body>
</html>`;
    const fileName = `public/${body.elementName}.html`;
    fs.access(fileName, fs.constants.F_OK, (err) => {
      if (err) {
        res.writeHead(409);
        res.write('File does not exist on server.');
        res.end();
      } else {
        writeNewFile(fileName, fileData);
      }
    });
  }

  function writeNewFile(fileName, fileData) {

    fs.writeFile(fileName, fileData, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
      ++elements;
      readIndex('add', body.elementName);
    });
  }

  function readIndex(method, element) {
    const fileName = `public/index.html`;
    if (method === 'add') {
      fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
          console.log(err);
        }
        addIndexElement(data, element);
      });
    }
  }

  function addIndexElement(data, element) {
    data = data.toString();
    endOfListIndex = data.indexOf('</ol>');
    data = `${data.substr(0, endOfListIndex)}\
  <li>
      <a href="/${element}.html">${element.charAt(0).toUpperCase() + element.slice(1)}</a>
    </li>
    ${data.substr(endOfListIndex)}`;

    h3Index = data.indexOf('<h3>') + 4;
    h3EndIndex = data.indexOf('</h3>');
    data = `${data.substr(0, h3Index)}There are ${elements}${data.substr(h3EndIndex)}`;
    fs.writeFile('public/index.html', data, (err) => {
      if (err) throw err;
      res.writeHead(200);
      res.write('File has been successfully saved.');
      res.end();
    });

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
        postFile(body);
        break;
      }
      case 'PUT': {
        putFile(body);
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