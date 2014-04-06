/**
 * Module dependencies.
 */

var express = require('express');
 var flash = require('connect-flash'); 
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var crypto = require('crypto');
var len = 128;
var iterations = 12000;
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
var tourdates;
var tourdatesschema;
var userSchema;
var users;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  	dbIsOpen = true;

	 youtubeVidSchema = new mongoose.Schema({
	  name : String,
	  url: { type: String }
	});

	userSchema = new mongoose.Schema({
	    username: String,
	    salt: String,
	    hash: String
	});

	tourdatesschema = new mongoose.Schema({
		location : String,
		venue 	 : String,
		date 	 : Date,
		tickets  : String,
		showDate : String
	});


	// Compile a 'Movie' model using the movieSchema as the structure.
	// Mongoose also creates a MongoDB collection called 'Movies' for these documents.
	youtubevids = mongoose.model('youtubevids', youtubeVidSchema);
	users = mongoose.model('users', userSchema);
	tourdates = mongoose.model('tourdates', tourdatesschema);
	//lower case?


});




/*function authenticatedCheck(req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect("/admin");
    }
}

function userExist(req, res, next) {
    users.count({
        username: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            // req.session.error = "User Exist"
            res.redirect("/admin");
        }
    });
}*/





app.configure(function(){
  app.use(flash());
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

passport.deserializeUser(function(id, done) {
            users.findById(id, function(err,user){        
                if(err){done(err);}
                	done(null,user);
            });
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/admin')
}

//app.get('/helloworld', ensureAuthenticated, routes.helloworld);
//app.get('/login', routes.login);
app.post('/login',
  	passport.authenticate('local', { successRedirect: '/admin_panel',
                                   failureRedirect: '/admin',
                                   failureFlash: true })
);



function generateFinalHash(algorithm, salt, password, numberOfIterations){
	try {
	    var hash = password;
	    for(var i=0; i<numberOfIterations; ++i) {
	      hash = crypto.createHmac(algorithm, salt).update(hash).digest('hex');
	    }
	    return algorithm + '$' + salt + '$' + numberOfIterations + '$' + hash;
	  } catch (e) {
	    throw new Error('Invalid message digest');
	  }

}

function generateHash(password){

	if(typeof password != 'string' ){
		//validation
	}
	if(password.lenght < 7){
		//validation
	}

	//generate salt of length 8
	var saltLength = 8;
	var algorithm = 'sha1';
	var numberOfIterations = 1;
	var salt = crypto.randomBytes(Math.ceil(saltLength / 2)).toString('hex').substring(0, saltLength);
	return(generateFinalHash(algorithm, salt, password, numberOfIterations))
}




function verifyHash(password, hash){

	var hashParts = hash.split('$');
	console.log(hashParts.length);
	if(hashParts.length == 3){
		hashParts.splice(2, 0, 1);
		hash = hashParts.join("$");
	}

	console.log('generated = '+generateFinalHash(hashParts[0], hashParts[1], password, hashParts[2]));



	if(hash == generateFinalHash(hashParts[0], hashParts[1], password, hashParts[2])){
		return true;
	}else{
		return false;
	}
}


passport.use(new LocalStrategy(function(username, password, done) {
    users.findOne({ username: username }, function(err, user) {
      if (err) { 
        return done(err); 
      }
      if (!user) {
      	console.log("Incorrect Login Details");
        return done(null, false, { message: 'Incorrect Login Details' });
      }


  //  var testHash = generateHash('password');
   // console.log('test hash = ' + testHash);

	if (verifyHash(password, user.hash)) 
    {
    	console.log("correct pass")
    	return done(null, user._id);
    }
    else
    {
    	console.log("Incorrect")
        return done(null, false, { message: 'Incorrect password.' });
	}


      return done(null, user);
    });
  }
));


app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/admin_panel',
    failureRedirect: '/admin',
     failureFlash: true
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
		tourdates.
    		find().
    			sort( {date: 1} ).
    			    	exec( function ( err, tour){
					res.render('index', {
						url1 : videolist[0].url,
						url2 : videolist[1].url, 
						url3 : videolist[2].url,
						thumb1 : getScreen(videolist[0].url),
						thumb2 : getScreen(videolist[1].url),
						thumb3 : getScreen(videolist[2].url),
						tour : tour,
					});
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


app.get('/admin_panel', ensureAuthenticated, function (req, res){


	if(!dbIsOpen){		
		console.log("db not open" );
		return;
	}

			res.render('admin_home', {
		});
});






app.get('/content/:name', ensureAuthenticated, function (req, res){


	if(!dbIsOpen){		
		console.log("db not open" );
		return;
	}


	var name = req.params.name;

	if(name == "video.html"){
		youtubevids.find({}, function(err, videolist){
	  	res.render('content/' + name, {
	  		adurl1 : videolist[0].url,
	  		adurl2 : videolist[1].url,
	  		adurl3 : videolist[2].url,
	  	});
	  });
	}
	else if(name == "live.html"){
		tourdates.
    		find().
    			sort( {date: 1} ).
    				exec( function ( err, tour){
						res.render('content/'+name,{
						tour : tour
						});
				});
	}
	else{
		res.render('content/'+name,{	
		});
	}


});




app.post('/addNewDate', function(req, res) {
	tourDate = new Date(req.body.year,req.body.month-1, req.body.day  );
	 new tourdates({
	 	location : req.body.location,
		venue 	 : req.body.venue,
		showDate 	 : req.body.day + "/" + req.body.month,
		tickets  : req.body.tickets,
		date: tourDate


	  }).save( function( err, tour, count ){
	    res.redirect( 'admin_panel#/live' );
	  });
});

app.get( '/deleteDate/:id', function ( req, res ){
  	tourdates.findById( req.params.id, function ( err, dates ){
    dates.remove( function ( err, dates ){
      res.redirect( 'admin_panel#/live');
    });
  });
});




app.post('/saveVideo', function(req, res) {



	  youtubevids.findOneAndUpdate({name:"vid1"}, { $set: { url: req.body.left}}, {upsert:true},  function(err, person) {
	  if (err) {
	    console.log('got an error');
	  }else{
	  	

	  youtubevids.findOneAndUpdate({name:"vid2"}, { $set: { url: req.body.middle }}, {upsert:true},  function(err, person) {
	  if (err) {
	    console.log('got an error');
	  }else{
	  	
  		  youtubevids.findOneAndUpdate({name:"vid3"}, { $set: { url: req.body.right }}, {upsert:true},  function(err, person) {
		  if (err) {
		    console.log('got an error');
		  }else{
  			res.redirect('admin_panel#/video')	  	
	  }
     });	  	
	  }
     });
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