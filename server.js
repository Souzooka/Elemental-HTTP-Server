/*jshint esversion:6*/
const http = require('http');
const requestHandler = require('./requestHandler');

const server = http.createServer(requestHandler);

server.listen(8080);