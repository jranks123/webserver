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
