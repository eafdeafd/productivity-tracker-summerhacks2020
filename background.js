'use strict';
let redirectURL = "https://www.google.com";
let blockedURLs = ["https://www.youtube.com/"];

function isBlocked(url){
  for(let blocked of blockedURLs){
    // let regex = RegExp(blocked);
    // if(regex.test(url)){
    //   return true;
    // }
    console.log(url);
    if(blocked === url){
      return true;
    }
  }
  return false;
}
  

//handle messages from other scripts 
chrome.runtime.onMessage.addListener(function(response, sender, sendResponse){
	if(sender.tab){ //message from content script or New Tab
    let responseObj = {
      isBlocked: isBlocked(sender.tab.url),
      url: redirectURL
    };
    sendResponse(responseObj);
	} else { // message from popup.html
		redirectURL = response;
	}	
});


//allows extension to display on all tabs that go to actual websites 
chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {hostContains: '.'},
    })
    ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
  }]);
});