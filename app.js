function requireHTTPS(req, res, next) {
    if (!req.secure) {
        //FYI this should work for local development as well
        var redirectURL = 'https://' + req.get('host') + req.url;
        return res.redirect(redirectURL.replace("8000", "3000"));
    }
    next();
}



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
var port = process.env.PORT || 3000;
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
app.use(app.router);

});

app.configure('development', function(){
  app.use(express.errorHandler());
});


//SET UP SERVERS
var server = https.createServer(options, app).listen(port, function(){
  console.log("https express server listening on port " + port + ". Enter the site via https at https://localhost:3000");
});

http.createServer(app).listen(8000, function(){
  console.log('http express server listening on port 8000 . Enter the site via http at localhost:8000');
});




//INITIALISE DATABASE

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




//AUTHENTICATION
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
        return done(null, false, { message: 'Incorrect Login Details' });
	}


      return done(null, user);
    });
  }
));




//LOGIN AND PASSWORD FORMS

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



//MAIN SITE PAGE
app.get('/', function (req, res){


	if(!dbIsOpen){		
		console.log("db not open" );
		return;
	}

	function getScreen( url )
	{
	  if(url === null){ return ""; }
	  var vid;
	  var results;
	  results = url.match("[\\?&]v=([^&#]*)");
	  vid = ( results === null ) ? url : results[1];
	   return "http://img.youtube.com/vi/"+vid+"/0.jpg";
	  
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

app.get('/admin_reset',  ensureAuthenticated, function (req, res){
			res.render('admin_reset', {
		});
	});


//
app.get('/admin_panel', ensureAuthenticated, function (req, res){


	if(!dbIsOpen){		
		console.log("db not open" );
		return;
	}

			res.render('admin_home', {
		});
});



//THE RESET PASSWORD SCREEN
app.post('/admin_reset', function(req,res){
	res.redirect('admin_panel');
});


//TO LOG OUT OF ADMIN
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/admin_panel');
});



//FOR VIEWING ANGULAR PAGES
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



//UPDATE THE BIO
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



//ADD A NEW DATE
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


//DELETE A DATE
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






//INITIALISE DATABASE

app.get('/demo', function(req, res){
	users.remove({}, function(err) { 
	  console.log('collection removed') 
	});

	tourdates.remove({}, function(err) { 
	  console.log('collection removed') 
	});


	bios.remove({}, function(err) { 
	   console.log('collection removed') 
	});

	youtubevids.remove({}, function(err) { 
	   console.log('collection removed') 
	});
	res.render('demo', {
	});
});



app.post('/initialiseDatabase', function(req,res){
	var biosIan1 = new bios();
	var biosIan2 = new bios();
	var biosIan3 = new bios();
	biosIan1.bio = "Arcade Fire is an indie rock band based in Montreal, Quebec, Canada, consisting of husband and wife Win Butler and Régine Chassagne, along with Win's brother Will Butler, Richard Reed Parry, Tim Kingsbury and Jeremy Gara. The band's current touring line-up also includes former core member Sarah Neufeld, frequent collaborator Owen Pallett, and two additional percussionists, Diol Edmond and Tiwill Duprate";
	biosIan2.bio = "Founded in 2001 by friends and classmates Win Butler and Josh Deu, the band came to prominence in 2004 with the release of their critically acclaimed debut album Funeral, and has won numerous awards, including the 2011 Grammy for Album of the Year (they hold the distinction of being the only musical group to have won their first and only Grammy in that category), the 2011 Juno Award for Album of the Year, and the 2011 Brit Award for Best International Album for their third studio album, The Suburbs, released in 2010 to critical acclaim and commercial success.";	
	biosIan3.bio = "In earlier years, they won the 2008 Meteor Music Award for Best International Album and the 2008 Juno Award for Alternative Album of the Year for their second studio album, Neon Bible. They also received nominations for the Best Alternative Music Album Grammy for all three of their studio albums. The band's work has also been twice named as a short list nominee for the Polaris Music Prize in 2007 for Neon Bible and in 2011 for The Suburbs, winning the award for The Suburbs. In 2013, Arcade Fire released their fourth album Reflektor and scored the feature film Her, for which William Butler (current member of the band) and Owen Pallett were nominated for Best Original Score at the 86th Academy Awards";

	biosIan1.save(function(err, save){
		if(err){
			throw err;
			console.log(err);
		}else{
			biosIan2.save(function(err, save){
			if(err){
				throw err;
				console.log(err);
			}else{
				biosIan3.save(function(err, save){
				if(err){
					throw err;
					console.log(err);
				}else{
					var userIan = new users();
					userIan.username = req.body.username;
					userIan.hash = generateHash(req.body.password);
					userIan.save(function(err, save){
					if(err){
						throw err;
						console.log(err);
						res.redirect('/demo');
					}else{
								 
						 var vid1 = new youtubevids();
						 vid1.name = "vid1";
						 vid1.url = "8dqEJSTLOQM";
						 var vid2 = new youtubevids();
						 vid2.name ="vid2";
						 vid2.url = "T4JrQpzno5Y";
						 var vid3 = new youtubevids();
						 vid3.name = "vid3";
						 vid3.url = "EcKinnMXuKg";

						  vid1.save(function(err, person) {
							  if (err) {
							    console.log('got an error');
							  }else{
							  		vid2.save(function(err, person) {
								  	if (err) {
								    console.log('got an error');
							  		}else{
										vid3.save(function(err, person) {	
											if (err) {
							    				console.log('got an error');
							 				 }else{
												var date1 = new tourdates();
												var date2 = new tourdates();
												var date3 = new tourdates();

											 	date1.venue = "Glastonbury Music and Arts Festival";
												date1.location	 = "GLASTONBURY, UK";
												date1.showDate = "14/03";
												date1.tickets  = "http://www.glasto.com"
												date1.date = new Date(2014, 03, 14);

											 	date2.venue = "Rankin's Heritage Festival";
												date2.location 	 = "BRISTOL, UK";
												date2.showDate = "15/03";
												date2.tickets  = "http://www.wordpress.com/paranoidmanboy"
												date2.date = new Date(2014, 03, 15);

											 	date3.venue = "Koko Music Hall";
												date3.location 	 = "BERLIN, GERMANY";
												date3.showDate = "18/04";
												date3.tickets  = "http://www.glasto.com"
												date3.date = new Date(2014, 04, 18);

											 	 date1.save(function(err, person) {
												 	if (err) {
												    	console.log('got an error');
												  	}else{
												  		date2.save(function(err, person) {
												  		if (err) {
												    		console.log('got an error');
												  		}else{
															date3.save(function(err, person) {	
																if (err) {
												    				console.log('got an error');
												  				}else{
										  			
												 					 res.redirect('/admin_panel');
										  				  	
													  			}
												    		 });	  	
													  }
												     });
												  }
											     });

											  }
										     });	  	
									  }
								     });
								}
								});

							}
							});
						}
						});
					}
					});
			}
			});


	});

