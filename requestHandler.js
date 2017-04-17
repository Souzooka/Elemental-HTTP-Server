/*jshint esversion:6*/
function requestHandler(req, res) {
  const net = require('net');
  const fs = require('fs');
  const http = require('http');
  const querystring = require('querystring');
  const getHandler = require('./getHandler');
  var auth = require('basic-auth');

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
    const fileName = `public/${body.elementName}.html`;
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      if (!credentials) {
        res.writeHead(401, {
          'Date'          : new Date().toUTCString(),
          'Server'        : 'HackerSpace'
        });
        res.write(`This server is using authentication.

  Please provide a "name" and "pass" key with your requests.`);
        res.end();
        return null;
      }
      else if (credentials.name !== 'Souzooka' || credentials.pass !== 'secretPassword') {
        res.writeHead(401, {
          'Date'          : new Date().toUTCString(),
          'Server'        : 'HackerSpace'
        });
        res.write(`Invalid password or username.`);
        res.end();
        return null;
      }
    }

    switch (method) {
      case 'GET': {
        getHandler(req, res);
        break;
      }
      case 'POST': {
        fs.access(fileName, fs.constants.F_OK, (err) => {
          if (err) {
            ++elements;
            writeNewFile(body);
          } else {
            res.writeHead(409, {
            'Date'          : new Date().toUTCString(),
            'Server'        : 'HackerSpace'
            });
            res.write('File already exists on server.');
            res.end();
          }
        });
        break;
      }
      case 'PUT': {
        fs.access(fileName, fs.constants.F_OK, (err) => {
          if (err) {
            res.writeHead(409, {
            'Date'          : new Date().toUTCString(),
            'Server'        : 'HackerSpace'
            });
            res.write('File does not exist on server.');
            res.end();
          } else {
            writeNewFile(body);
          }
        });
        break;
      }
      case 'DELETE': {
        fs.unlink(fileName, (err) => {
          if (err) {
            res.writeHead(409, {
            'Date'          : new Date().toUTCString(),
            'Server'        : 'HackerSpace'
            });
            res.write('File does not exist on server.');
            res.end();
          }
          console.log('The file has been deleted!');
          --elements;
          fs.readFile(fileName, 'utf8', (err, data) => {
            if (err) {
              console.log(err);
            }
            deleteIndexElement(data, element);
          });
        });
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




  function writeNewFile(body) {
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
    fs.writeFile(fileName, fileData, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
      fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
          console.log(err);
        }
        addIndexElement(data, body.elementName);
      });
    });
  }

  function addIndexElement(data, element) {
    data = data.toString();
    let h3Index = data.indexOf('<h3>') + 4;
    let h3EndIndex = data.indexOf('</h3>');
    let endOfListIndex = data.indexOf('</ol>');

    data = `${data.substr(0, endOfListIndex)}\
    <li id='${element}'>
      <a href="/${element}.html">${element.charAt(0).toUpperCase() + element.slice(1)}</a>
    </li>
    ${data.substr(endOfListIndex)}`;
    data = `${data.substr(0, h3Index)}There are ${elements}${data.substr(h3EndIndex)}`;

    fs.writeFile('public/index.html', data, (err) => {
      if (err) {
        console.log(err);
      }
      res.writeHead(200, {
        'Date'          : new Date().toUTCString(),
        'Server'        : 'HackerSpace'
      });
      res.write('File has been successfully saved.');
      res.end();
    });
  }

  function deleteIndexElement(data, element) {
    data = data.toString();

    let h3Index = data.indexOf('<h3>') + 4;
    let h3EndIndex = data.indexOf('</h3>');
    let liIndex = data.indexOf(`<li id='${element}'>`);
    let endOfListIndex = data.indexOf('</li>', liIndex) + 5;

    data = data.slice(0, liIndex) + data.slice(endOfListIndex);
    data = `${data.substr(0, h3Index)}There are ${elements}${data.substr(h3EndIndex)}`;

    fs.writeFile('public/index.html', data, (err) => {
      if (err) {
        console.log(err);
      }
      res.writeHead(200, {
        'Date'          : new Date().toUTCString(),
        'Server'        : 'HackerSpace'
      });
      res.write('File has been successfully deleted.');
      res.end();
    });
  }
}

module.exports = requestHandler;