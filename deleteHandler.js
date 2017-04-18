function deleteHandler(req, res, body) {

  fs.unlink(fileName, (err) => {
    if (err) {
      res.writeHead(409, {
      'Date'          : new Date().toUTCString(),
      'Server'        : 'HackerSpace'
      });
      res.write('File does not exist on server.');
      res.end();
    }
    fs.readFile(fileName, 'utf8', (err, data) => {
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
  });
}