/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

app.engine('.html', require('ejs').__express);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));
app.use('/public', express.static(__dirname + '/public'));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



//app.get('/', routes.index);
app.get('/', function (req, res){
	var URL1 = 'http://www.youtube.com/embed/8dqEJSTLOQM';
	var URL2 = 'http://www.youtube.com/embed/T4JrQpzno5Y';
	var URL3 = 'http://www.youtube.com/embed/EcKinnMXuKg';
	res.render('index', {
		url1 : URL1,
		url2 : URL2, 
		url3 : URL3,
		thumb1 : 'afterlife.png',
		thumb2 : 'rebellion.png',
		thumb3 : 'suburbs.png',
	});
});

app.get('/admin', function (req, res){
			res.render('admin_index', {
		});
	});

app.get('/admin_reset', function (req, res){
			res.render('admin_reset', {
		});
	});

app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
