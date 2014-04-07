var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs');
var app = express();

app.set('view engine', 'ejs');
app.use(app.router);
app.use(express.cookieParser()); 
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function(req, res) {
  res.sendfile('index.html')
});

/* serves all the static files */
app.get(/^(.+)$/, function(req, res){ 
   //console.log('static file request : ' + req.params);
   res.sendfile( __dirname + req.params[0]); 
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
 console.log("Listening on " + port);
});