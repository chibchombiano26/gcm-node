var Parse = require('parse/node');
var GCM = require('../gcm/gcm.js');
var gcm = new GCM('AIzaSyB7uOYVF4PBiNz1DRoA3k_YXHrlGsYnPuQ');

Parse.initialize("dYTgLQ0c874WYkUCn5oBIUejz5VDHtjSK7W80sxY", "1lmRylKsZkNhVAOaD1CtIByJeQidAtFr58UpwKjQ");

var notificaciones ={};

notificaciones.push = function(req, res){
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
      
      notificaciones.saveMessage({message: message, id: req.body.id });
      
      gcm.send(msg, function(err, response){
        console.log(response);
        res.send(response.success);
      });
}

notificaciones.saveMessage = function (data){
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

notificaciones.getMessage = function(req, res){
  var subscriptionId = req.body.subscriptionId;
  var GameScore = Parse.Object.extend("PushMessage");
  var query = new Parse.Query(GameScore);
  query.equalTo("identificator", subscriptionId);
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
}

module.exports = notificaciones;