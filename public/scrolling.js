        //glide scroll wooooooooo
        $('a[href*=#]:not([href=#])').click(function() {
            if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') 
                || location.hostname == this.hostname) {

                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
                   if (target.length) {
                     $('html,body').animate({
                         scrollTop: target.offset().top
                    }, 800);
                    return false;
                }
            }
        });

        //sticky nav bar at scroll point
            $(document).ready(function() {

                $(window).scroll(function () {
                    var scrollTop = $(window).scrollTop(),
                    windowHeight = $(window).height(),
                    elementOffset = $('.marker').offset().top,
                    logoElementOffset = $('.logoMarker').offset().top,
                    distance = (elementOffset - scrollTop),
                    logoDistance = (logoElementOffset - scrollTop),
                    proportion = distance/windowHeight;                    
                    //secondaryDistance = (secondaryOffset - scrollTop);
                    
                    //fix the navbar at the top unless you're on the starting 'splash'
                    if ($(window).width() > 680) {
                        if (distance < 50) {
                            $('#nav').addClass('navbar-fixed');
                            $('#logo').addClass('logo-fixed');
                         }
                        if (distance > 51) {
                            $('#nav').removeClass('navbar-fixed');
                            $('#logo').removeClass('logo-fixed');                    
                        }
                    }
                    //amended for mobile devices alternate navigation size
                    if ($(window).width() < 681) {
                        if (distance < 90) {
                            $('#nav').addClass('navbar-fixed');
                            $('#logo').addClass('logo-fixed');
                         }
                        if (distance > 91) {
                            $('#nav').removeClass('navbar-fixed');
                            $('#logo').removeClass('logo-fixed');                    
                        }
                    }

                    for(i = 0; i < 1; i = i + 0.1){
                        if (proportion < i) {
                            $('#logosvg').addClass('newlogo' + Math.round( (i * 10)+2 ));
                         }

                        if (proportion > i) {
                            $('#logosvg').removeClass('newlogo'+ Math.round( (i * 10)+2 ));
                        }
                  }

            });
            });

            window.addEventListener('load', function() {}, false);