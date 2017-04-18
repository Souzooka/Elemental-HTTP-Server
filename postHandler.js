/*jshint esversion:6*/
const fs = require('fs');
const templateBuilder = require('./templateBuilder.js');

function postHandler(req, res, body) {
  const newFileName = `public/elements/${body.elementName}.html`;
  const elementTemplatePath = 'templates/elementTemplate.html';
  const indexPath = 'public/index.html';

  fs.access(newFileName, fs.constants.F_OK, (err) => {
    if (err) {
      fs.readFile(elementTemplatePath, 'utf8', (err, data) => {
        if (err) {
          return serverError();
        }
        const fileData = templateBuilder(body, data);
        fs.writeFile(newFileName, fileData, (err) => {
          if (err) {
              return serverError();
            }
          fs.readFile(indexPath, 'utf8', (err, data) => {
            if (err) {
              return serverError();
            }
            addIndexElement(data, body.elementName);
          });
        });
      });
    } else {
      res.writeHead(409, {
      'Date'          : new Date().toUTCString(),
      'Server'        : 'HackerSpace'
      });
      res.write('File already exists on server.');
      res.end();
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

  function addIndexElement(data, element) {
    data = data.toString();
    let endOfListIndex = data.indexOf('</ol>');
    let elementsCountIndex = data.indexOf('id="elements-count"');
    elementsCountIndex = data.indexOf('>', elementsCountIndex) + 1;
    let elementsCountIndexEnd = data.indexOf('</', elementsCountIndex);
    let elementsCount = data.slice(elementsCountIndex, elementsCountIndexEnd);
    ++elementsCount;

    // Add new element to list
    data = `${data.substr(0, endOfListIndex)}\
  <li id="${element}">
      <a href="elements/${element}.html">${element.charAt(0).toUpperCase() + element.slice(1)}</a>
    </li>
    ${data.substr(endOfListIndex)}`;
    // Update count of elements
    data = `${data.substr(0, elementsCountIndex)}${elementsCount}${data.substr(elementsCountIndexEnd)}`;

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
}

module.exports = postHandler;