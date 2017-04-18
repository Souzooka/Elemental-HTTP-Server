/*jshint esversion:6*/
const fs = require('fs');

function getHandler(req, res) {

  let file = 'public' + req.url;
  if (file === 'public/') {
    file = 'public/index';
  }

  // if a file extension is not specified, assume it is .html
  if (file.indexOf('.') === -1) {
    file += '.html';
  }

  // grab the file extension for later use
  let fileExtension = file.slice(file.indexOf('.')+1);

  fs.readFile(file, 'utf8', (err, data) => {
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

  function sendGETResponse(data, status = 200) {
    res.writeHead(status, {
      'Content-Type'  : `text/${fileExtension}`,
      'Content-Length': data.length,
      'Date'          : new Date().toUTCString(),
      'Server'        : 'HackerSpace'
    });
    res.write(`${data}`);
    res.end();
  }
}

module.exports = getHandler;