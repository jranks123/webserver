$(function() {
    $('.drawer').addClass('hideB');
    var easter_egg = new Konami('neonbible.html');

    });

$(document).ready(function(){
            var d = new Date();
            //var min = 1;
            //var max = 2;
            // and the formula is:
            //var random = Math.floor(Math.random() * (max - min + 1)) + min;
            //console.log(random);
            if((7 < d.getHours()) && (d.getHours() < 23)){ //if between 6am and 7pm make 'daytime' theme
                $("head").append("<link rel='stylesheet' href='css/theme.css'>");
                //$('link[rel=stylesheet][href~="css/theme.css"]').remove();
            }
        });