/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require ('passport-local').Strategy;
mongoose.connect('mongodb://localhost/arcadeDB');

var app = express();

app.engine('.html', require('ejs').renderFile);

// all environments
app.set('port', process.env.PORT || 3000);
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
//app.use(app.router);

/*
app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});




passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password != password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


*/
var db = mongoose.connection;
var dbIsOpen = false;
var youtubevids;
var youtubeVidSchema ;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  	dbIsOpen = true;
	  youtubeVidSchema = new mongoose.Schema({
	  name : String,
	  url: { type: String }
	});


	var users = new mongoose.Schema({
	  username : String,
	  password : String
	});
	// Compile a 'Movie' model using the movieSchema as the structure.
	// Mongoose also creates a MongoDB collection called 'Movies' for these documents.
	youtubevids = mongoose.model('youtubevids', youtubeVidSchema);
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






var userSchema = mongoose.Schema({
    username: String,
    password: String
});
userSchema.methods.validPassword = function (password) {
  if (password === this.password) {
    return true; 
  } else {
    return false;
  }
}
var User = mongoose.model('User', userSchema);
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ cookie: { maxAge: 30000 }, secret: 'secret' }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { 
        return done(err); 
      }
      if (!user) {
      	console.log("Incorrect Login Details");
        return done(null, false, { message: 'Incorrect Login Details' });
      }
      if (password != user.password || !user) {
      	console.log("Incorrect Login Details");
        return done(null, false, { message: 'Incorrect Login Details' });
      }
      return done(null, user);
    });
  }
));


app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/admin_panel',
    failureRedirect: '/admin',
  })
);







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

		youtubevids.find({}, function(err, videolist){
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

app.get('/admin_panel', function (req, res){
			res.render('admin_home', {
		});
	});

app.get('/admin_panel', function (req, res){

	if(!dbIsOpen){		
		console.log("db not open" );
		return;
	}

		YoutubeVids.find({}, function(err, videolist){
			res.render('admin_home', {
				adurl1 : videolist[0].url,
				adurl2 : videolist[1].url, 
				adurl3 : videolist[2].url,
			});
		});
});





app.get('/content/:name', function (req, res){


	if(!dbIsOpen){		
		console.log("db not open" );
		return;
	}

		var name = req.params.name;
		if(name == 'video.html'){
			youtubevids.find({}, function(err, videolist){
			  	res.render('content/' + name, {
			  		adurl1 : videolist[0].url,
			  		adurl2 : videolist[1].url,
			  		adurl3 : videolist[2].url,
			  	});
			});
		}
		else{
			res.render('content/' + name, {});

		}
	
});




app.post('/saveVideo', function(req, res) {


  youtubevids.findOneAndUpdate({name:"vid1"}, { $set: { url: 'hi' }}, {upsert:true},  function(err, person) {
  if (err) {
    console.log('got an error');
  }else{
  	res.render('content/video.html') ,{
  	}
  }



     });
	});





    






    	//IGNORE ALL BELOW

        // Set our collection
      /*  var collection = db.find('YoutubeVids');

        // Submit to the DB
        collection.update(
        	{name: "vid1"},
        	{
        		name:"vid1",
        		url:"hello"
        	},
        	{upsert: true}
        );*/

   // });




 

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
