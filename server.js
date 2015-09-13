

var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var notificaciones = require('./notificaciones/notification.js');
var realtime = require("./realtime/socketIo.js");
var cors = require("./midelware/cors.js");



var socketio = require('socket.io');


var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(cors.headers);

var server = http.createServer(app);
var io = socketio.listen(server);

app.use(express.static(path.resolve(__dirname, 'client')));


io.on('connection', function (socket) {
    realtime.connection(socket);
});


app.post('/push', function (req, res) {
      notificaciones.push(req, res);
});

app.post('/notifications', function (req, res) {
  notificaciones.getMessage(req, res);
});


server.listen(process.env.PORT, function(){
  
});
