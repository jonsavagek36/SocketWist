let express = require('express');
let path = require('path');
let app = express();
let wist = require('./wistapp');

app.use(express.static(path.join(__dirname, 'public')));

let http = require('http').createServer(app).listen(3000);
let io = require('socket.io')(http);

io.sockets.on('connection', function(socket) {
  wist.initGame(io, socket);
});
