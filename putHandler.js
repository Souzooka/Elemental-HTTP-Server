/*jshint esversion:6*/
const fs = require('fs');

function putHandler(req, res, body) {
  const fileName = `public/elements/${body.elementName}.html`;

  fs.access(fileName, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(409, {
      'Date'          : new Date().toUTCString(),
      'Server'        : 'HackerSpace'
      });
      res.write('File does not exist on server.');
      res.end();
    } else {
      writeNewFile();
    }
  });

  function writeNewFile() {
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
    fs.writeFile(fileName, fileData, (err) => {
      if (err) {
          res.writeHead(500, {
          'Date'          : new Date().toUTCString(),
          'Server'        : 'HackerSpace'
          });
          res.write('Server error.');
          res.end();
        }
      fs.readFile('public/index.html', 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500, {
          'Date'          : new Date().toUTCString(),
          'Server'        : 'HackerSpace'
          });
          res.write('Server error.');
          res.end();
        }
        addIndexElement(data, body.elementName);
      });
    });
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

module.exports = putHandler;