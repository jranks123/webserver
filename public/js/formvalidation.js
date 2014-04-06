function urlChecker(url){
	var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
	if (regexp.test(url)){
		return 1;	
	}
	else {
		return 0;
	}
}

function formChecker() {
	var loc=document.forms["liveDatesForm"]["location"].value;
	if (loc==null || loc=="")
	{
	  alert("You must include a location");
	  return false;
	}

	var venue=document.forms["liveDatesForm"]["venue"].value;
	if (venue==null || venue=="")
	{
	  alert("You must include a venue");
	  return false;
	}

	var ticketurl=document.forms["liveDatesForm"]["tickets"].value;
	if (ticketurl==null || ticketurl=="")
	{
	  alert("You must include a ticket URL");
	  return false;
	}

	var urlValidation = urlChecker(ticketurl)
	if (urlValidation == 0)
	{
		alert("Invalid URL. URLs must begin with http:// or https://")
		return false;
	}


}