
let redirectURL = "https://www.google.com";

//listens to background script in case of tab updates
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	block(request);
  }
);

function block(request){
	window.stop();
	redirectURL = request.redirectURL;
	alert(`Your extension has blocked the current webpage. You will be redirected to ${redirectURL}.`)
	changeURL();
}

function changeURL(){
	window.location.href = redirectURL;
}
