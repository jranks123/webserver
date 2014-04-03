var win=$(window),
head=$("#home"),
audio=$("#audio"),
live=$("#live");


win.scroll(function(){
	head.css("background-position","50%"+(($(this).scrollTop()/9)-200)+"px");
	audio.css("background-position","50%"+(($(this).scrollTop()/9)-300)+"px");
	live.css("background-position","50%"+(($(this).scrollTop()/9)-400)+"px");
	});