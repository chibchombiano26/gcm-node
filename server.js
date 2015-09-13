

var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var async = require('async');
var GCM = require('./gcm.js');
var gcm = new GCM('AIzaSyB7uOYVF4PBiNz1DRoA3k_YXHrlGsYnPuQ');
var Parse = require('parse/node');

Parse.initialize("dYTgLQ0c874WYkUCn5oBIUejz5VDHtjSK7W80sxY", "1lmRylKsZkNhVAOaD1CtIByJeQidAtFr58UpwKjQ");

var socketio = require('socket.io');


var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

var server = http.createServer(app);
var io = socketio.listen(server);

app.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];


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

function saveMessage(data){
  var Message = Parse.Object.extend("PushMessage");
  var message = new Message();
  
  message.set("message", data.message);
  message.set("identificator", data.id);
  
  
  message.save(null, {
    success: function(message) {
      // Execute any logic that should take place after the object is saved.
      console.log('New object created with objectId: ' + message.id);
    },
    error: function(message, error) {
      // Execute any logic that should take place if the save fails.
      // error is a Parse.Error with an error code and message.
      console.log('Failed to create new object, with error code: ' + error.message);
    }
  });
}


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
      
      saveMessage({message: message, id: req.body.id });
      
      gcm.send(msg, function(err, response){
        console.log(response);
        res.send(response.success);
      });
});

app.post('/notifications', function (req, res) {
  var rid = req.body;
  var GameScore = Parse.Object.extend("PushMessage");
  var query = new Parse.Query(GameScore);
  query.equalTo("identificator", "4");
  query.descending("createdAt");
  query.limit(1);
  query.find({
    success: function(results) {
      for (var i = 0; i < results.length; i++) {
        var object = results[i];
        console.log(object.id + ' - ' + object.get('message'));
        res.writeHeader(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(object));
      }
    },
    error: function(error) {
      console.log("Error: " + error.code + " " + error.message);
    }
  });
});


server.listen(process.env.PORT, function(){
  
});
