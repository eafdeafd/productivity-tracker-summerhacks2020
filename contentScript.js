
let redirectURL = "https://www.google.com";
// chrome.runtime.sendMessage("", function(response){
// 	parseResponse(response);
// });

//listens to background script in case of tab updates
window.onbeforeunload = chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	if(isBlocked(request)){
  		sendResponse("URL blocked");
  		changeURL();
  	} else {
  		sendResponse("URL not blocked");
  	}
  }
);

function isBlocked(response){
	if(response.isBlocked){
		window.stop();
		redirectURL = response.redirectURL;
		alert(`Your extension has blocked the current webpage. You will be redirected to ${redirectURL}. If you believe this is a mistake, try unblocking some websites.`)
		return true;
	}
	return false;
}

function changeURL(){
	window.location.href = redirectURL;
}
