
function slider(album){ 
    $('.drawer').addClass('inline');  
    var allDraw = $('.drawer');
    var empty = true;
    allDraw.each(function() {
        if($(this).is(":visible")){
          empty = false;
        }
    });
    if(empty){
        var div_height = $('#audio').height() + 450;
        $('#audio').animate({
        height: div_height}, 200); 
        $(album).toggleClass('hideB'); 
        window.setTimeout(function(){ $(album).toggleClass('active');},400);
               

    }else if($(album).is(':visible')){
       var div_height = $('#audio').height() - 450;
             $(album).toggleClass('active');
             $(album).toggleClass('hideB');
            $('#audio').animate({
                height: div_height}, 200);
    } else{
      $('.drawer').removeClass('inline');  
      $(album).toggleClass('hideB'); 
      
      allDraw.not(album).each(function() {
        if($(this).is(":visible")){
            console.log("made it into the loop");
             $(this).toggleClass('active');
             $(this).toggleClass('hideB');
        }
        });
         $(album).toggleClass('active'); 

    }
}


$('#reflektor').click(function(e){
    slider('#slidereflektor');
});

$('#thesuburbs').click(function(e){
    slider('#slidesuburbs');
});

$('#neonbib').click(function(e){
    slider('#slideneonbible');
});

$('#funeralalb').click(function(e){
    slider("#slidefuneral");
});

$('#ep').click(function(e){
    slider('#slideep');
});
      
