var GCM = require('./gcm.js');
var gcm = new GCM('AIzaSyB7uOYVF4PBiNz1DRoA3k_YXHrlGsYnPuQ');
var express = require('express');
var app = express();
var http = require('http');


var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', function (req, res) {
  res.send('Hello World!');
});


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

app.set('port', process.env.PORT || 3000);

var server = http.createServer(app).listen(app.get('port'), function(){
    var addr = server.address();
    console.log("Servidor andando en ", addr.address + ":" + addr.port);
});