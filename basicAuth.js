/*jshint esversion:6*/

function basicAuth(req, res) {

  const auth = require('basic-auth');
  const credentials = auth(req);
  const username = 'Souzooka';
  const password = 'secretPassword';

  // return values:
  // true if user has correct credentials
  // false otherwise (this function will reply and shut down the connection)
  function isAuthorized() {

    if (!credentials) {
      res.writeHead(401, {
        'Date'          : new Date().toUTCString(),
        'Server'        : 'HackerSpace'
      });
      res.write(`This server is using basic-auth.

Please provide a "name" and "pass" key with your requests.`);
      res.end();
      return false;
    }
    else if (credentials.name !== username || credentials.pass !== password) {
      res.writeHead(401, {
        'Date'          : new Date().toUTCString(),
        'Server'        : 'HackerSpace'
      });
      res.write(`Invalid password or username.`);
      res.end();
      return false;
    }
    return true;
  }

  return {isAuthorized};
}

module.exports = basicAuth;