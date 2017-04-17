/*jshint esversion:6*/
const net = require('net');
const fs = require('fs');
const http = require('http');
const querystring = require('querystring');
var auth = require('basic-auth');

let elements = 2;
const server = http.createServer( (req, res) => {

  function generateGETResponse(file) {
    var fileData = '';
    return fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        fs.readFile('public/404.html', 'utf8', (err, data) => {
          if (err) {
            console.log(err);
          }
          sendGETResponse(data, 404);
        });
      } else {
        sendGETResponse(data);
      }
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

  function deleteFile(body) {
    const fileName = `public/${body.elementName}.html`;
    fs.unlink(fileName, (err) => {
      if (err) {
        res.writeHead(409);
        res.write('File does not exist on server.');
        res.end();
      }
      console.log('The file has been deleted!');
      --elements;
      readIndex('delete', body.elementName);
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
    else if (method === 'delete') {
      fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
          console.log(err);
        }
        deleteIndexElement(data, element);
      });
    }
  }

  function addIndexElement(data, element) {
    data = data.toString();
    endOfListIndex = data.indexOf('</ol>');
    data = `${data.substr(0, endOfListIndex)}\
    <li id='${element}'>
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

  function deleteIndexElement(data, element) {
    data = data.toString();

    let h3Index = data.indexOf('<h3>') + 4;
    let h3EndIndex = data.indexOf('</h3>');
    let liIndex = data.indexOf(`<li id='${element}'>`);
    let endOfListIndex = data.indexOf('</li>', liIndex) + 10;

    data = `${data.substr(0, h3Index)}There are ${elements}${data.substr(h3EndIndex)}`;
    data = data.slice(0, liIndex) + data.slice(endOfListIndex);

    fs.writeFile('public/index.html', data, (err) => {
      if (err) throw err;
      res.writeHead(200);
      res.write('File has been successfully deleted.');
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

  req.on('data', function(chunk) {
    body.push(chunk);
  });

  req.on('end', () => {
    body = querystring.parse(Buffer.concat(body).toString());
    const credentials = auth(req);
    if (!credentials || credentials.name !== 'Souzooka' || credentials.pass !== 'secretPassword') {
      if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
        res.writeHead(401);
        res.write(`This server is using authentication.

Please provide a "username" and "password" key with your requests.`);
        res.end();
        return null;
      }
    }
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
      case 'DELETE': {
        deleteFile(body);
        break;
      }
      case 'HEADERS': {
        res.writeHead(200);
        res.end();
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