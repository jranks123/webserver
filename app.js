// setup 
// ----------------------------- 
var express 	= require('express');
var flash 		= require('connect-flash'); 
var app 		= module.exports = express();
var http 		= require('http');
var https 		= require('https');
var fs 			= require('fs');
var helmet 		= require('helmet');
var path 		= require('path');
var crypto 		= require('crypto');
var mongoose 	= require('mongoose');
var nodemailer	= require('nodemailer');
var passport 	= require('passport');
var LocalStrat	= require ('passport-local').Strategy;
var expressV 	= require('express-validator');
var database 	= require('./config/datab');
var users 		= require('./models/users');
mongoose.connect(database.src);
var options 	= { key: fs.readFileSync('./config/sec/key.pem'), cert: fs.readFileSync('./config/sec/cert.pem')};
var port 		= process.env.PORT || 443;


// environments/config
// ----------------------------- 
app.engine('.html', require('ejs').renderFile);
app.set('port', process.env.PORT || 443);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));
app.use('/public', express.static(__dirname + '/public'));

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(helmet.xframe());
	app.use(helmet.iexss());
	app.use(helmet.contentTypeOptions());
	app.use(helmet.cacheControl());
	app.use(expressV());
	app.use(express.methodOverride());
	app.use(express.cookieParser('secret'));
	app.use(express.session({ cookie: {httpOnly:true, secure:true,  maxAge: 5*60*1000 } }));
	app.use(flash());
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


// database go! 
// ----------------------------- 
var db = module.exports.db = mongoose.connection;
var dbIsOpen = module.exports.open = false;
var dbEmpty = module.exports.empty = false;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback (){ dbIsOpen = module.exports.open = true; });


// dev env 
// ----------------------------- 
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


// routes 
// ----------------------------- 
require('./routes')(app);
require('./routes/login')(app);
require('./routes/error')(app);


// start https server on arranged port (default 443 but changed if on herokuapp etc)
// ----------------------------- 
var server = https.createServer(options, app).listen(port, function(){
  console.log("https express server listening on port " + port + ".");
});


// create http server listening on port 80 to forward to https w/ 301 
// ----------------------------- 
http.createServer(function(req, res){
     res.writeHead(301, {
       'Content-Type': 'text/plain', 
       'Location':'https://'+req.headers.host+req.url
   	 });
     res.end('Redirecting to SSL\n');
  }).listen(80);
