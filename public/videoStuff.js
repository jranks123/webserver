$(function() {

	$('#main').on('load', function(){

		$('#video1').hide();
		$('#video2').hide();
	});


	// Find all YouTube videos
	var $allVideos = $("iframe[src^='http://www.youtube.com']"),

	    // The element that is fluid width
	    $fluidEl = $("#video .embeddedVideo");

	// Figure out and save aspect ratio for each video
	$allVideos.each(function() {

		$(this)
			.data('aspectRatio', this.height / this.width)

			// and remove the hard coded width/height
			.removeAttr('height')
			.removeAttr('width');

	});

	// When the window is resized
	// (You'll probably want to debounce this)
	$(window).resize(function() {

		var newWidth = $fluidEl.width();

		// Resize all videos according to their own aspect ratio
		$allVideos.each(function() {

			var $el = $(this);
			$el
				.width(newWidth)
				.height(newWidth * $el.data('aspectRatio'));

		});

	// Kick off one resize to fix all videos on page load
	}).resize();

	function moveVids(subMov, rebMov, aftMov){
		$('#suburbs').animate({ 
        		right: subMov,
      			}, 'slow' );
		$('#rebellion').animate({ 
	        		right: rebMov,
	      			}, 'slow' );
		$('#afterlife').animate({ 
			       right: aftMov,
			    }, 'slow' );
	}

	function changeZindex(sub, reb, after){
		$('#afterlife').css('z-index', after);
		$('#rebellion').css('z-index', reb);
		$('#suburbs').css('z-index', sub);
	}

	$('.rightButton').on('click', function() {

		if ($('#video1').is(':visible')){
			hideVid('#video1', 'vid1', ' ');
			showVid('#video2', 'vid2', 'http://www.youtube.com/embed/T4JrQpzno5Y?controls=0&showinfo=0');
			changeZindex(10, 10, 0);
			moveVids("+=150px", "+=150px", "-=300px");

		}else if ($('#video2').is(':visible')){
			hideVid('#video2', 'vid2', ' ');
			showVid('#video3', 'vid3', 'http://www.youtube.com/embed/EcKinnMXuKg?controls=0&showinfo=0');
			changeZindex(10, 0, 10);
			moveVids("+=150px","-=300px", "+=150px");
		}else if ($('#video3').is(':visible')){
			hideVid('#video3', 'vid3', ' ');
			showVid('#video1', 'vid1', 'http://www.youtube.com/embed/8dqEJSTLOQM?controls=0&showinfo=0');
				changeZindex(0, 10, 10);
			moveVids("-=300px", "+=150px", "+=150px");

		}
	});

	$('.leftButton').on('click', function() {
		if ($('#video1').is(':visible')){
			hideVid('#video1', 'vid1', '#reflektorTitle');
			showVid('#video3', 'vid3', '#afterlifeTitle');
			changeZindex(0, 10, 10);
			moveVids("+=300px", "-=150px", "-=150px");
		}else if ($('#video2').is(':visible')){
			hideVid('#video2', 'vid2', '#suburbsTitle');
			showVid('#video1', 'vid1', '#reflektorTitle');
			changeZindex(10, 10, 0);
			moveVids( "-=150px", "-=150px", "+=300px");
		}else if ($('#video3').is(':visible')){
			hideVid('#video3', 'vid3', '#afterlifeTitle');
			showVid('#video2', 'vid2', '#suburbsTitle');
			changeZindex(10, 0, 10);
			moveVids("-=150px","+=300px", "-=150px");
			
		}
	});



	function hideVid(videoName, vidName, newSrc){
		//document.getElementById(vidName).src=newSrc;
		$(videoName).hide();
	}

	function showVid(videoName, vidName, newSrc){
		$(videoName).show();
		//document.getElementById(vidName).src=newSrc;
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


});
