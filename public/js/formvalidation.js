function urlChecker(url){
	var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
	if (regexp.test(url)){
		return 1;	
	}
	else {
		return 0;
	}
}

function IDChecker(id){
	var alphanum = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
	if(!alphanum.test(id)){
		return 1;
	}
    else{
    	return 0;
	}
}

function liveFormChecker() {

	// LIVE DATES FORM
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

function videoFormChecker() {
	var IDvalid = 0;

	//VIDEO URL FORM
	var vid1=document.forms["videoForm"]["left"].value;
	var vid2=document.forms["videoForm"]["middle"].value;
	var vid3=document.forms["videoForm"]["right"].value;
	var nvid1 = vid1.length;
	var nvid2 = vid2.length;
	var nvid3 = vid3.length;

	if (nvid1<10 || nvid1>12 || nvid2<10 || nvid2>12 || nvid3<10 || nvid3>12)
	{
	  alert("You must enter a valid YouTube IDs. Valid YouTube IDs are between 10 and 12 characters.");
	  return false;
	}

	IDvalid = IDChecker(vid1);
	IDvalid = IDvalid + IDChecker(vid2);
	IDvalid = IDvalid + IDChecker(vid3);
	if (!IDvalid==0)
	{
	  alert("You must enter a valid YouTube IDs. Valid YouTube IDs are strictly alphanumeric.");
	  return false;
	}
}


function userFormChecker() {
	
	//USER URL FORM
	var vid1=document.forms["videoForm"]["left"].value;
	var vid2=document.forms["videoForm"]["middle"].value;
	var vid3=document.forms["videoForm"]["right"].value;
	
	if (!IDvalid==0)
	{
	  alert("You must enter a valid YouTube IDs. Valid YouTube IDs are strictly alphanumeric.");
	  return false;
	}
}