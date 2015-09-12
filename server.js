var GCM = require('./gcm.js');
var gcm = new GCM('AIzaSyB7uOYVF4PBiNz1DRoA3k_YXHrlGsYnPuQ');
var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var async = require('async');

//var socketio = require('socket.io');


var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies



var server = http.createServer(app);
//var io = socketio.listen(server);

app.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];

/*
io.on('connection', function (socket) {
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}
*/

app.post('/push', function (req, res) {
      
      var rid = req.body.rid;
      var message = req.body.message;
      
      
      var arrayIds = [];
      arrayIds.push(rid);
      
      var msg = {
        registration_ids: arrayIds,
        //collapse_key: "your_collapse_key",
        time_to_live: 180,
        data: {
          message: message
        }
      };
      
      gcm.send(msg, function(err, response){
        console.log(response);
        res.send(response.success);
      });
});


server.listen(process.env.PORT, function(){
  
});
