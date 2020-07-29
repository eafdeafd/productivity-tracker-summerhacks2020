
let redirectURL = "https://www.google.com";

chrome.runtime.sendMessage("", function(response){
	if(response.isBlocked){
		redirectURL = response.redirectURL;
		let current = document.getElementsByTagName("title")[0].innerText
		alert(`Your extension has blocked the ${current} webpage. You will be redirected to ${redirectURL}.`)
	    changeURL();
	}
});

function changeURL(){
	window.location.href = redirectURL;
}
