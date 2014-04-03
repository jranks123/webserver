$('#light').click(function(e){
 	$("head").append("<link rel='stylesheet' href='theme.css'>");
});


$('#dark').click(function(e){
    $('link[rel=stylesheet][href~="theme.css"]').remove();
});