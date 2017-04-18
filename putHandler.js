/*jshint esversion:6*/
const fs = require('fs');
const templateBuilder = require('./templateBuilder.js');

function putHandler(req, res, body) {
  const fileName = `public/elements/${body.elementName}.html`;
  const elementTemplatePath = 'templates/elementTemplate.html';
  const indexPath = 'public/index.html';

  fs.access(fileName, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(409, {
      'Date'          : new Date().toUTCString(),
      'Server'        : 'HackerSpace'
      });
      res.write('File does not exist on server.');
      res.end();
    } else {
      fs.readFile(elementTemplatePath, 'utf8', (err, data) => {
        if (err) {
          return serverError();
        }
        console.log(err, data)
        const fileData = templateBuilder(body, data);
        fs.writeFile(fileName, fileData, (err) => {
          if (err) {
              return serverError();
            }
          fs.readFile(indexPath, 'utf8', (err, data) => {
            if (err) {
              return serverError();
            }
            res.writeHead(200, {
              'Date'          : new Date().toUTCString(),
              'Server'        : 'HackerSpace',
              'Content-Type'  : 'application/json'
            });
            res.write(JSON.stringify({success: true}));
            res.end();
          });
        });
      });
    }
  });

  function serverError(err = 'Server error.') {
    res.writeHead(500, {
    'Date'          : new Date().toUTCString(),
    'Server'        : 'HackerSpace'
    });
    res.write(err);
    res.end();
  }
}

module.exports = putHandler;