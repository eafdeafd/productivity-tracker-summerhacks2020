'use strict';
let websiteURL = "https://www.google.com";
chrome.runtime.onMessage.addListener(function(response, sender, sendResponse){
	if(sender.tab){
		sendResponse(websiteURL);
	} else {
		websiteURL = response;
	}	
})
chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {hostContains: '.'},
    })
    ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
  }]);
});