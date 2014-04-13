//
// This routing usage file deals with the errors
// such as 404 and 500 when users
// end up in the wrong place! 
//

module.exports = function (app) {

	app.get('/403', function (req, res){
		res.render('err/403', {	
		});
	});

	app.get('/500', function (req, res){
		res.render('err/500', {	
		});
	});


	// 404 create ------------------ //
	// ----------------------------- //
	app.use(function (req, res){
	  res.status(404);

	  if (req.accepts('html')) {		// render if req is a browser
	    res.render('err/404', {			// then show them a 404 page 
	    	url: req.url });			// on the site
	    return;
	  }

	  if (req.accepts('json')) {			//alternatively
	    res.send({ 							//send json response if accepted
	    	error: '404 - Not found' });
	    return;
	  }

	  res.type('txt').send('404 - Not found');		//send txt if none of above
	});

	// other create ---------------- //
	// ----------------------------- //
	app.use(function(err, req, res, next){
	  res.status(500);
	  res.render('err/500', { 
	  	error: 'Unknown Error Occured!' });
	});

	
};