//
// This routing file deals with the logic
// surrounding the cryptography of user login 
// and sessions, and the install script. For more general 
// routing, please use index.js! X
//

var passport 	= require('passport');
var application	= require('../app');
var youtubevids = require('../models/videos');
var users 		= require('../models/users');
var tourdates 	= require('../models/live');
var bios 		= require('../models/bio');
var crypto 		= require('crypto');
var helmet 		= require('helmet');
var LocalStrat	= require('passport-local').Strategy;

/// login checker 
// ----------------------------- 
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
  	return next(); 
  }
  res.redirect('403')
}

/// crypto functions  
// ----------------------------- 
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
	var saltLength = 8;
	var algorithm = 'sha1';
	var numberOfIterations = 1;
	var salt = crypto.randomBytes(Math.ceil(saltLength / 2)).toString('hex').substring(0, saltLength);
	return(generateFinalHash(algorithm, salt, password, numberOfIterations));
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

/// routing 
// ----------------------------- 
module.exports = function(app) {

	/// login routing 
	// ----------------------------- 
	app.post('/login',
  	passport.authenticate('local', { successRedirect: '/admin_panel',
                                   failureRedirect: '/admin',
                                   failureMessage: "Oops! Invalid username or password :-(" })
	);

	/// change password if authenticated 
	// ----------------------------- 
	app.post('/changePass', ensureAuthenticated, function(req, res){
		//check hashes
		if (verifyHash(req.body.currentPassword, req.user.hash)){
			//check matching password and pw length is valid
			if((req.body.newPassword == req.body.confPassword) && (req.body.newPassword.length > 8)){
				  users.findOneAndUpdate({_id:req.user._id}, { $set: { hash: generateHash(req.body.newPassword)}}, {upsert:true},  function(err, person) {
					  if (err) {
					    res.redirect('admin_panel#/failPassword'); //NOPE
					  }else{
					  	res.redirect('admin_panel#/account'); //YAY
					  }
				});
			}else{
				res.redirect('admin_panel#/failPassword'); //NOPE
			}
		}else{
			res.redirect('admin_panel#/failPassword'); //NOPE
		}
	});

	/// routing for adding a new user 
	// ----------------------------- 
	app.post('/createUser', ensureAuthenticated, function(req, res){
		req.assert('newPass', 'New password required').len(8);			//
		req.assert('confPass', 'Confirm password required').len(8);		//check all fields are valid
		req.assert('newEmail', 'Please include email').notEmpty();		//
		req.assert('newUsername', 'Please include valid username').notEmpty();
		var errors = req.validationErrors();

		users.count({username : req.body.newUsername}, function(req1, res1){
			if(res1 > 0){
				console.log('res1 = '+res1);							// fail if username
				 res.redirect( 'admin_panel#/failUsernameDupe' );		// already exists!
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


	// ------------------------------------------------------- //
 	// ------- logout routing + return to login page --------- //
 	// ------------------------------------------------------- //
	app.get('/logout', function(req, res){
	  req.logout();
	  res.redirect('/admin');
	});



	// install default demo data script 
	// ----------------------------- 
	app.post('/initialiseDatabase', function(req,res){
		// demo data input function for ian default install
		//
		// install will only occur when we have a blank
		// database to begin with, otherwise this function
		// can never be accessed :)

		var biosIan1 = new bios();
		var biosIan2 = new bios();
		var biosIan3 = new bios();
		biosIan1.bio = "Arcade Fire is an indie rock band based in Montreal, Quebec, Canada, consisting of husband and wife Win Butler and Régine Chassagne, along with Win's brother Will Butler, Richard Reed Parry, Tim Kingsbury and Jeremy Gara. The band's current touring line-up also includes former core member Sarah Neufeld, frequent collaborator Owen Pallett, and two additional percussionists, Diol Edmond and Tiwill Duprate";
		biosIan2.bio = "Founded in 2001 by friends and classmates Win Butler and Josh Deu, the band came to prominence in 2004 with the release of their critically acclaimed debut album Funeral, and has won numerous awards, including the 2011 Grammy for Album of the Year (they hold the distinction of being the only musical group to have won their first and only Grammy in that category), the 2011 Juno Award for Album of the Year, and the 2011 Brit Award for Best International Album for their third studio album, The Suburbs, released in 2010 to critical acclaim and commercial success.";	
		biosIan3.bio = "In earlier years, they won the 2008 Meteor Music Award for Best International Album and the 2008 Juno Award for Alternative Album of the Year for their second studio album, Neon Bible. They also received nominations for the Best Alternative Music Album Grammy for all three of their studio albums. The band's work has also been twice named as a short list nominee for the Polaris Music Prize in 2007 for Neon Bible and in 2011 for The Suburbs, winning the award for The Suburbs. In 2013, Arcade Fire released their fourth album Reflektor and scored the feature film Her, for which William Butler (current member of the band) and Owen Pallett were nominated for Best Original Score at the 86th Academy Awards";

		biosIan1.save(function(err, save){
			// throw errors if any of the bio data cannot be
			// saved to the database
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
						//set up user account
						//make sure data is good before proceeding
						var userIan = new users();
						userIan.username = req.body.username;
						userIan.hash = generateHash(req.body.password);
						userIan.save(function(err, save){
						if(err){
							throw err;
							console.log(err);
							res.redirect('/install');
						}else{
							//set up the default youtube videos
							//as selected by the band	 
							 var vid1 = new youtubevids();
							 vid1.name = "vid1";
							 vid1.url = "8dqEJSTLOQM";
							 var vid2 = new youtubevids();
							 vid2.name ="vid2";
							 vid2.url = "T4JrQpzno5Y";
							 var vid3 = new youtubevids();
							 vid3.name = "vid3";
							 vid3.url = "YdXFv4wgrgg";

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
								 				 	//set up the sample tour dates
								 				 	//data from the band's schedule
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
											  							 //finish and go to admin panel
													 					 res.render('admin_created', { 
													 					 	user: userIan.username }); 	
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


	// password reset attempt
	app.get('/admin_reset', function (req, res){
			res.render('admin_reset', {
		});
	});


	//reset post action
	app.post('/admin_reset', function(req,res){
		res.redirect('admin_panel');
	});


	// sessions helper
	// ----------------------------- 
	passport.use(new LocalStrat(function(username, password, done) {
	    users.findOne({ username: username }, function(err, user) {
	      if (err) { 
	        return done(err); 
	      }
	      if (!user) {
	      	console.log("Incorrect Login Details");
	        return done(null, false, { message: 'Incorrect Login Details' });
	      }
	 	  if (verifyHash(password, user.hash)) {
	    	console.log("Login details accepted.")
	    	return done(null, user._id);
	      } else{
	    		console.log("Incorrect Login Details")
	        	return done(null, false, { message: 'Incorrect Login Details' });
		  }
	      return done(null, user);
	    });
	  }

	));


	// session serialize!! 
	// ----------------------------- 
	passport.serializeUser(function(user, done) {
	   	done(null, user);
	});
	passport.deserializeUser(function(id, done) {
	        users.findById(id, function(err,user){        
	            if(err){done(err);}
	            	done(null,user);
	        });
	});


};