$('#light').click(function(e){
 	$("head").append("<link rel='stylesheet' href='css/theme.css'>");
});


$('#dark').click(function(e){
    $('link[rel=stylesheet][href~="css/theme.css"]').remove();
});