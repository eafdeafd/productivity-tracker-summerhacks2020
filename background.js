'use strict';

let defaultVal = "https://www.google.com";
let redirectURL = undefined;
updateRedirectURL();
let blockedURLs = ["https://www.youtube.com/" , "https://www.roblox.com/Login"];

function setRedirectURL(url){
  chrome.storage.sync.set({"redirectURL": url}, function() {
    console.log("Set redirectURL to ", url);
  });
  updateRedirectURL();
}

function updateRedirectURL(){
  let storedURL = defaultVal;
  chrome.storage.sync.get(["redirectURL"], function(result) {
    if (result.redirectURL !== undefined) {
      storedURL = result.redirectURL;
    }
    console.log("Got stored value of", result.redirectURL);
    redirectURL = storedURL;
  })
}

function isBlocked(url){
  for(let blocked of blockedURLs){
    // let regex = RegExp(blocked);
    // if(regex.test(url)){
    //   return true;
    // }
    // console.log(url);
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
      redirectURL: redirectURL
    };
    sendResponse(responseObj);
	} else { // message from popup.html
		setRedirectURL(response);
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
