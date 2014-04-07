/**
 * Module dependencies.
 */


var express = require('express');
 var flash = require('connect-flash'); 
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var https = require('https');
var fs = require('fs');
var helmet = require('helmet');
var path = require('path');
var crypto = require('crypto');
var len = 128;
var iterations = 12000;
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require ('passport-local').Strategy;
var expressValidator = require('express-validator');
mongoose.connect('mongodb://localhost/arcadeDB');
var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

var app = express();

var port = 3000;



/*https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(8000);*/

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







function requireHTTPS(req, res, next) {
    if (!req.secure) {
        //FYI this should work for local development as well
        var redirectURL = 'https://' + req.get('host') + req.url;
        return res.redirect(redirectURL.replace("8000", "3000"));
    }
    next();
}

var db = mongoose.connection;
var dbIsOpen = false;
var youtubevids;
var youtubeVidSchema ;
var tourdates;
var tourdatesschema;
var userSchema;
var users;
var biosSchema;
var bios;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  	dbIsOpen = true;

	 youtubeVidSchema = new mongoose.Schema({
	  name : String,
	  url: { type: String }
	});

	userSchema = new mongoose.Schema({
	    username: String,
	    email : String,
	    hash: String
	});

	tourdatesschema = new mongoose.Schema({
		location : String,
		venue 	 : String,
		date 	 : Date,
		tickets  : String,
		showDate : String
	});

	biosSchema = new mongoose.Schema({
		name : String,
		bio : String
	});

	youtubevids = mongoose.model('youtubevids', youtubeVidSchema);
	users = mongoose.model('users', userSchema);
	tourdates = mongoose.model('tourdates', tourdatesschema);
	bios= mongoose.model('bios', biosSchema);

	//lower case?


});






app.configure(function(){
  app.use(flash());
  app.set('views', __dirname + '/views');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(helmet.xframe());
  app.use(helmet.iexss());
  app.use(helmet.contentTypeOptions());
  app.use(helmet.cacheControl());
  app.use(expressValidator());
  app.use(express.methodOverride());
  app.use(express.cookieParser('secret'));
  app.use(express.session({ cookie: {httpOnly:true, secure:true,  maxAge: 5*60*1000 } }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(requireHTTPS);
  /*app.use(express.csrf());
  app.use(function (req, res, next) {
  	res.locals.csrftoken = req.session._csrf;
    next();
  });*/
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
	if(hashParts.length == 3){
		hashParts.splice(2, 0, 1);
		hash = hashParts.join("$");
	}





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


app.post('/changePass', ensureAuthenticated, function(req, res){

	if (verifyHash(req.body.currentPassword, req.user.hash)){
		if((req.body.newPassword == req.body.confPassword) && (req.body.newPassword.length > 8)){
			  users.findOneAndUpdate({_id:req.user._id}, { $set: { hash: generateHash(req.body.newPassword)}}, {upsert:true},  function(err, person) {
				  if (err) {
				    res.redirect('admin_panel#/failPassword');
				  }else{
				  	res.redirect('admin_panel#/account');
				  }
			});
		}else{
			res.redirect('admin_panel#/failPassword');
		}
	}else{
		res.redirect('admin_panel#/failPassword');
	}
	});


app.post('/createUser', ensureAuthenticated, function(req, res){
	req.assert('newPass', 'Please enter a location').len(8);
	req.assert('confPass', 'Please enter the venue').len(8);
	req.assert('newEmail', 'Please include valid ticket link').notEmpty();
	req.assert('newUsername', 'Please include valid ticket link').notEmpty();
	var errors = req.validationErrors();
	users.count({username : req.body.newUsername}, function(req1, res1){

		if(res1 > 0){
			console.log('res1 = '+res1);
			 res.redirect( 'admin_panel#/failUsernameDupe' );
		}
		else if((req.body.newPass == req.body.confPass) && (!errors)){
			hashNew = generateHash(req.body.newPass);
			new users({
				username: req.body.newUsername,
				hash 	 : hashNew,
				email : req.body.newEmail
				  }).save( function( err, tour, count ){
				    res.redirect( 'admin_panel#/account' );
				  });
		}else{
			res.redirect('admin_panel#/failAddUser');
		}
		});
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

	bios.find({}, function(bierr, bio){
		youtubevids.find({}, function(err, videolist){
			tourdates.
	    		find().
	    			sort( {date: 1} ).
	    			    	exec( function ( err, tour){
	    			   	if(bierr){
	    			   		return;
	    			   	}
						res.render('index', {
							bio : bio,
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



app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/admin_panel');
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
	else if(name == "about.html"){
		bios.find({}, function(err, bio){
	  	res.render('content/' + name, {
	  		bio : bio,
	  		newLine : '\n',
	  	});
	  });
	}
	else if(name == "live.html"){
		tourdates.
    		find().
    			sort( {date: 1} ).
    				exec( function ( err, tour){
						res.render('content/'+name,{
						tour : tour,
						});
				});
	}
	else{
		res.render('content/'+name,{	
		});
	}


});


app.post('/UpdateBio', function(req, res){
	  var unvalidParagraphs = req.body.bio.replace(/\t|\r|/g, '').split('\n');
	  var paragraphs = [];
	  	 var i;
	  for(i = 0; i < unvalidParagraphs.length; i++){
	  	if (unvalidParagraphs[i].replace(/(\r\n|\n|\r)/gm,'').replace(/ /g,'') != ''){
	  		paragraphs.push(unvalidParagraphs[i]);
	  	}
	  }


	  bios.remove({}, function () { }); 
	  for(i = 0; i < paragraphs.length; i ++){
	  	 new bios({
	  	 	bio : paragraphs[i],
	  	 	name : "p"
	  	 }).save(function( err, tour, count ){
		    
		  });

		}
		res.redirect( 'admin_panel#/about' );
	});


app.post('/addNewDate', function(req, res) {
	req.assert('location', 'Please enter a location').notEmpty();
	req.assert('venue', 'Please enter the venue').notEmpty();
	req.assert('tickets', 'Please include valid ticket link').notEmpty();
	var errors = req.validationErrors();


	function urlChecker(url){
		var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
		if (regexp.test(url)){
			return 1;	
		}
		else {
			return 0;
		}
	};

	var urlhandler = req.body.tickets;
	var validURL = urlChecker(urlhandler);

	if ((!errors) && (validURL==1)){
		tourDate = new Date(req.body.year,req.body.month-1, req.body.day  );
		 new tourdates({
		 	location : req.body.location,
			venue 	 : req.body.venue,
			showDate : req.body.day + "/" + req.body.month,
			tickets  : req.body.tickets,
			date: tourDate


		  }).save( function( err, tour, count ){
		    res.redirect( 'admin_panel#/live' );
		  });
		}
		else {
			res.redirect( 'admin_panel#/failDate');
		}
});



app.get( '/deleteDate/:id', function ( req, res ){
  	tourdates.findById( req.params.id, function ( err, dates ){
    dates.remove( function ( err, dates ){
      res.redirect( 'admin_panel#/live');
    });
  });
});



app.post('/saveVideo', function(req, res) {
	req.assert('left', 'Featured video must be 11 char code').len(10,12);
	req.assert('middle', 'Featured video must be 11 char code').len(10,12);
	req.assert('right', 'Featured video must be 11 char code').len(10,12);
	var errors = req.validationErrors();

	function IDCheck(id){
		var alphanum = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
		if(!alphanum.test(id)){
			return 1;
		}
	    else{
	    	return 0;
		}
	}

	var vide1 = req.body.left;
	var vide2 = req.body.middle;
	var vide3 = req.body.right;
	var validIDs = IDCheck(vide1)+IDCheck(vide2)+IDCheck(vide3);

	if (!errors && validIDs==0) {
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
	} else{
		res.redirect( 'admin_panel#/failVideo');
	}
});





    


var server = https.createServer(options, app).listen(port, function(){
  console.log("https express server listening on port " + port + ". Enter the site via https at https://localhost:3000");
});


 

http.createServer(app).listen(8000, function(){
  console.log('http express server listening on port 8000 . Enter the site via http at localhost:8000');
});
