
let redirectURL = "https://www.google.com";
let current = document.getElementsByTagName("title")[0].innerText
chrome.runtime.sendMessage(current, function(response){
	redirectURL = response;
	alert(`Your extension has blocked the ${current} webpage. You will be redirected to ${redirectURL}.`)
    changeURL();
});
function changeURL(){
	window.location.href = redirectURL;
}
