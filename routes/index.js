//
// This routing file deals with the main website,
// and the function of the administration panel
// as well as rendering simple pages. Use login.js for 
// the login routing logic. XX
//

var passport 	= require('passport');
var application	= require('../app');
var youtubevids = require('../models/videos');
var users 		= require('../models/users');
var tourdates 	= require('../models/live');
var bios 		= require('../models/bio');



function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
  	return next();
  }													//redirect to denied page if user 
  res.redirect('/403')								//tries to sneak into authenticated areas	
}

module.exports = function (app) {

	// -------------------------- //
  	// ------- homepage --------- //
  	// -------------------------- //
	app.get('/', function (req, res) {

	  	if(!application.open){		
			console.log("Error: Database is not open.");				// break if database isn't 
			return; 													// open to avoid site crashing
		}

		application.db.collection('youtubevids').count(function (err, count) {
			if (!err && count === 0) {									// if there's nothing in the 
				console.log("DB empty. Forwarding to db setup..." );	// database, install time!
				res.redirect('./install');		
   			} else {														
			  
			  function getScreen( url ){
			  if(url === null){ return ""; }
			  var vid;
			  var results;
			  results = url.match("[\\?&]v=([^&#]*)");
			  vid = ( results === null ) ? url : results[1];
			  return "http://img.youtube.com/vi/"+vid+"/0.jpg";			// plug youtube ID into thumbnail URL format
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
									bio : bio,									//
									url1 : videolist[0].url,					// render index with all
									url2 : videolist[1].url, 					// relevant dynamic data
									url3 : videolist[2].url,					// from the database :)
									thumb1 : getScreen(videolist[0].url),		//
									thumb2 : getScreen(videolist[1].url),
									thumb3 : getScreen(videolist[2].url),
									tour : tour,
								});
							});
				});
			});
		}
		});
	});


	// ----------------------------- //
	// ------- admin login --------- //
	// ----------------------------- //
	app.get('/admin', function (req, res){
		res.render('admin_index', {	
			fail: req.session.messages || []
		});
		req.session.messages = [];
	});



	// ------------------------------------- //
	// ------- admin control panel --------- //
	// ------------------------------------- //
	app.get('/admin_panel', ensureAuthenticated, function (req, res){ 	// must be authenticated access
	  	if(!application.open){		
			console.log("Error: Database is not open.");				// break if database isn't 
			return; 													// open to avoid site crashing
		}
		res.render('admin_home', {
		});
	});


	// --------------------------------------------------- //
	// ------- one time create master admin page --------- //
	// --------------------------------------------------- //
	app.get('/install', function(req, res){

		application.db.collection('users').count(function (err, count) {
			if (!err && count === 0) {
				res.render('install', {	
				});
   			} else {
				console.log("Master admin user already exists. Please log in." );
				users.find({}, function(err, userlist){
		  			res.render('masteradmin', {
		  			master : userlist[0].username
		  			});
		  		});
   			}
       	});
	});


	// -------------------------------- //
	// ------- wipe button !! --------- //
	// -------------------------------- //
	app.post('/databaseReset', function(req,res){
		res.redirect('reboot');
	});


	// -------------------------------- //
	// ------- master wipe DB --------- //
	// -------------------------------- //
	app.get('/reboot', ensureAuthenticated, function(req,res){
		users.remove({}, function(err) { 
		  console.log('collection removed') 
		});															//
		tourdates.remove({}, function(err) { 						// ability to wipe the whole
		  console.log('collection removed') 						// db to start from scratch
		});															// in case of errors. only
		bios.remove({}, function(err) { 							// authenticated users.
		   console.log('collection removed') 						//
		});
		youtubevids.remove({}, function(err) { 
		   console.log('collection removed') 
		});
		res.render('reboot', {
		});
	});



	// --------------------------------------------------------- //
	// ------- routing for all angular page injections --------- //
	// --------------------------------------------------------- //
	app.get('/content/:name', ensureAuthenticated, function (req, res){

		if(!application.open){		
			console.log("Error: Database not open." );
			return;
		}

		var name = req.params.name;								// get page ID for injection
																// and depending on which 
		if(name == "video.html"){								// page it is, inject different
			youtubevids.find({}, function(err, videolist){		// stuff from database into ejs
		  	res.render('./content/' + name, {					// template!
		  		adurl1 : videolist[0].url,
		  		adurl2 : videolist[1].url,
		  		adurl3 : videolist[2].url,
		  	});
		  });
		}	
		else if(name == "about.html"){
			bios.find({}, function(err, bio){
		  	res.render('./content/' + name, {
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
							res.render('./content/'+name,{
							tour : tour,
							});
					});
		}
		else if(name == "success.html"){
			res.render('./content/'+name,{
		  		page : req.flash('success')
			});
		}
		else{
			res.render('./content/'+name,{	
			});
		}
	});


	// ------------------------------------------------------------------ //
	// ------- save the videos you've submitted with video form --------- //
	// ------------------------------------------------------------------ //
	app.post('/saveVideo', function(req, res) {
		req.assert('left', 'Featured video must be 11 char code').len(10,12);
		req.assert('middle', 'Featured video must be 11 char code').len(10,12);
		req.assert('right', 'Featured video must be 11 char code').len(10,12);
		var errors = req.validationErrors();									//
																				// check youtube IDs are of valid 
		function IDCheck(id){													// length and only contain
			var alphanum = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;		// alphanumeric characters!
			if(!alphanum.test(id)){												//
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
		    console.log('Error updating vid1 in database');
		  }else{
		  youtubevids.findOneAndUpdate({name:"vid2"}, { $set: { url: req.body.middle }}, {upsert:true},  function(err, person) {
		  if (err) {
		    console.log('Error updating vid2 in database');
		  }else{	
	  		  youtubevids.findOneAndUpdate({name:"vid3"}, { $set: { url: req.body.right }}, {upsert:true},  function(err, person) {
			  if (err) {
			    console.log('Error updating vid3 in database');
			  }else{
			  	req.flash('success', 'video' );
	  			res.redirect('admin_panel#/success')	  	
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



	// ------------------------------------------------------------------------- //
	// ------- save the bio you've submitted and split into paragraphs --------- //
	// ------------------------------------------------------------------------- //
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
		  	 new bios({											// save bio split down into 
		  	 	bio : paragraphs[i],							// paragraphs to preserve structure
		  	 	name : "p"										// when displayed in html!
		  	 }).save(function( err, tour, count ){
			  });
		}
		req.flash('success', 'about' );
		res.redirect( 'admin_panel#/success' );
	});



	// ----------------------------------- //
	// ------- save new tourdate --------- //
	// ----------------------------------- //
	app.post('/addNewDate', function(req, res) {
		req.assert('location', 'Please enter a location').notEmpty();				// check fields are all full
		req.assert('venue', 'Please enter the venue').notEmpty();					// of data if not will mess up
		req.assert('tickets', 'Please include valid ticket link').notEmpty();		// our nth child layout!
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
		var validURL = urlChecker(urlhandler); 		// make sure the URL is a real URL

		if ((!errors) && (validURL==1)){
			tourDate = new Date(req.body.year,req.body.month-1, req.body.day  );
			 new tourdates({
			 	location : req.body.location,
				venue 	 : req.body.venue,
				showDate : req.body.day + "/" + req.body.month,		//save month and day for display
				tickets  : req.body.tickets,						//but keep the full date for
				date: tourDate 										//keeping shows ordered chronologically
			  }).save( function( err, tour, count ){
			    res.redirect( 'admin_panel#/live' );
			  });
			}
			else {
				res.redirect( 'admin_panel#/failDate');
			}
	});



	// ---------------------------------------------- //
	// ------- remove a tour date from list --------- //
	// ---------------------------------------------- //
	app.get( '/deleteDate/:id', function ( req, res ){
	  	tourdates.findById( req.params.id, function ( err, dates ){
	    dates.remove( function ( err, dates ){
	      res.redirect( 'admin_panel#/live');
	    });
	  });
	});


};