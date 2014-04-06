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

	var ticketurl=document.forms["liveDatesForm"]["venue"].value;
	if (ticketurl==null || ticketurl=="")
	  {
	  alert("You must include a ticket URL");
	  return false;
	}

	
}