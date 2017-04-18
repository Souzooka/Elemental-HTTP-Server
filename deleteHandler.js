/*jshint esversion:6*/
const fs = require('fs');

function deleteHandler(req, res, body) {
  const fileName = `public/elements/${body.elementName}.html`;

  fs.unlink(fileName, (err) => {
    if (err) {
      res.writeHead(409, {
      'Date'          : new Date().toUTCString(),
      'Server'        : 'HackerSpace'
      });
      res.write('File does not exist on server.');
      res.end();
    }
    fs.readFile(`public/index.html`, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, {
          'Date'          : new Date().toUTCString(),
          'Server'        : 'HackerSpace'
          });
          res.write('Server error.');
          res.end();
      }
      deleteIndexElement(data, body.elementName);
    });

    function deleteIndexElement(data, element) {
      data = data.toString();

      let liIndex = data.indexOf(`<li id="${body.elementName}">`);
      let endOfListIndex = data.indexOf('</li>', liIndex) + 5;
      let elementsCountIndex = data.indexOf('id="elements-count"');
      elementsCountIndex = data.indexOf('>', elementsCountIndex) + 1;
      let elementsCountIndexEnd = data.indexOf('</', elementsCountIndex);
      let elementsCount = data.slice(elementsCountIndex, elementsCountIndexEnd);
      --elementsCount;

      data = data.slice(0, liIndex) + data.slice(endOfListIndex);
      // Update count of elements
      data = `${data.substr(0, elementsCountIndex)}${elementsCount}${data.substr(elementsCountIndexEnd)}`;

      fs.writeFile('public/index.html', data, (err) => {
        if (err) {
          res.writeHead(500, {
          'Date'          : new Date().toUTCString(),
          'Server'        : 'HackerSpace'
          });
          res.write('Server error.');
          res.end();
        }
        res.writeHead(200, {
          'Date'          : new Date().toUTCString(),
          'Server'        : 'HackerSpace'
        });
        res.write('File has been successfully deleted.');
        res.end();
      });
    }
  });
}

module.exports = deleteHandler;