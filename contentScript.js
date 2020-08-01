
let redirectURL = "https://www.google.com";

// chrome.runtime.sendMessage("", function(response){
// 	parseResponse(response);
// });

//listens to background script in case of tab updates
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	parseResponse(request);
  }
);

function parseResponse(response){
	if(response.isBlocked){
		redirectURL = response.redirectURL;
		alert(`Your extension has blocked the ${response.originalURL} webpage. You will be redirected to ${redirectURL}.`)
	    changeURL();
	}
}

function changeURL(){
	window.location.href = redirectURL;
}
