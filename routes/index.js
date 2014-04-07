
/*
 * GET home page.
 */

var passport = require('passport');
var dbIsOpen = require('../app').open;

exports.index = function(req, res){

	if(!dbIsOpen){		
		console.log("db not open "+dbIsOpen );
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
};

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('content/' + name);
};


/*

module.exports = function (app) {

  app.get('/', function (req, res) {
      res.render('index', { user : req.user });
  });

  app.get('/register', function(req, res) {
      res.render('register', { });
  });

  app.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
          res.redirect('/');
        });
    });
  });


  app.get('/login', function(req, res) {
      res.render('login', { user : req.user });
  });

  app.post('/login', passport.authenticate('local'), function(req, res) {
      res.redirect('/');
  });

  app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });

  app.get('/ping', function(req, res){
      res.send("pong!", 200);
  });

};*/