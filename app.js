/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var mongoose = require('mongoose');


mongoose.connect('mongodb://localhost/arcadeDB');

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



var db = mongoose.connection;
var dbIsOpen = false;
var YoutubeVids;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  	dbIsOpen = true;
	var youtubeVidSchema = new mongoose.Schema({
	  name : String,
	  url: { type: String }
	});


	var users = new mongoose.Schema({
	  username : String,
	  password : String
	});
	// Compile a 'Movie' model using the movieSchema as the structure.
	// Mongoose also creates a MongoDB collection called 'Movies' for these documents.
	YoutubeVids = mongoose.model('YoutubeVids', youtubeVidSchema);
	users = mongoose.model('users', users);
	//lower case?

/*	var usernameAdmin = new users({
		username : 'admin',
		password : 'password'
	})

	usernameAdmin.save(function(err, usernameAdmin) {
	  if (err) return console.error(err);
	  console.dir(usernameAdmin);
	});*/
/*	//VID1
	var vid1 = new YoutubeVids({
		name : vid1,
		url : '8dqEJSTLOQM'
	})

	vid1.save(function(err, vid1) {
	  if (err) return console.error(err);
	  console.dir(vid1);
	});*/

/*	YoutubeVids.findOne({ title: 'vid1' }, function(err, vid1) {
	  if (err) return console.error(err);
	  console.log(vid1.url);
	}); */



	//VID2
/*	var vid2 = new YoutubeVids({
		name : vid2,
		url : 'T4JrQpzno5Y'
	})

	vid2.save(function(err, vid2) {
	  if (err) return console.error(err);
	  console.dir(vid2);
	});*/

	/*YoutubeVids.findOne({ title: 'vid2' }, function(err, vid2) {
	  if (err) return console.error(err);
	  console.log(vid2.url);
	});*/


	//VID3
/*	var vid3 = new YoutubeVids({
		name : vid3,
		url : 'EcKinnMXuKg'
	})

	vid3.save(function(err, vid3) {
	  if (err) return console.error(err);
	  console.dir(vid3);
	});*/

/*	YoutubeVids.findOne({ title: 'vid3' }, function(err, vid3) {
	  if (err) return console.error(err);
	  console.log(vid1.url);
	});*/
});






// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var findCallback = function(err, data)
{
	if (err)
	{
		console.log("found error " + err);
		return;
	}
	else
	{
		//getScreen(;
		return data.url;
	}
}


app.get('/', function (req, res){

	if(!dbIsOpen){		
		console.log("db not open" );
		return;
	}

	function getScreen( url, size )
	{
	  if(url === null){ return ""; }

	  size = (size === null) ? "big" : size;
	  var vid;
	  var results;

	  results = url.match("[\\?&]v=([^&#]*)");

	  vid = ( results === null ) ? url : results[1];

	  if(size == "small"){
	    return "http://img.youtube.com/vi/"+vid+"/2.jpg";
	  }else {
	    return "http://img.youtube.com/vi/"+vid+"/0.jpg";
	  }
	}

		YoutubeVids.find({}, function(err, videolist){
			res.render('index', {
				url1 : videolist[0].url,
				url2 : videolist[1].url, 
				url3 : videolist[2].url,
				thumb1 : getScreen(videolist[0].url),
				thumb2 : getScreen(videolist[1].url),
				thumb3 : getScreen(videolist[2].url),
			});
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
