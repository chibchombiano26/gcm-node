var realtime = {};
var async = require('async');


var sockets = [];
var messages = [];


realtime.connection = function(socket){
    
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      realtime.updateRoster();
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

        realtime.broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        realtime.updateRoster();
      });
    });
    
}

realtime.updateRoster = function() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      realtime.broadcast('roster', names);
    }
  );
}

realtime.broadcast = function(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

module.exports = realtime;