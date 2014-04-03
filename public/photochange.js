 var $switchimg = $('.photochange'); 
  var $next = 'img'; 
  var $change_duration = 1000; 
  var $pause = 4000;

  function swap(){
    return $switchimg.find($next);
  }

  swap().fadeOut();

  // set active classes
  swap().first().addClass('active');
  swap().first().fadeIn($change_duration);

  // auto scroll 
  $interval = setInterval(
      function(){
        var $i = $switchimg.find($next + '.active').index();
      
        swap().eq($i).removeClass('active');
        swap().eq($i).fadeOut($change_duration);
      
        if (swap().length == $i + 1) $i = -1; // loop to start
      
        swap().eq($i + 1).fadeIn($change_duration);
        swap().eq($i + 1).addClass('active');
      }
      , $change_duration +  $pause
  );