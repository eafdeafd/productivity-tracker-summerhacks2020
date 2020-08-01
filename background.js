'use strict';

let defaultVal = "https://www.google.com";
let redirectURL = undefined;
updateRedirectURL();
let blockedURLs = [];
updateBlockedURLs();

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
    redirectURL = storedURL;
  })
}

function setBlockedURLs(listBlocked){
  chrome.storage.sync.set({"blockedURLs": JSON.stringify(listBlocked)}, function() {
    console.log("Set blockedURLs to ", listBlocked);
  });
  updateBlockedURLs();
}

function updateBlockedURLs(){
  let stored = [];
  chrome.storage.sync.get(["blockedURLs"], function(result) {
    console.log(result);
    if (result.blockedURLs !== undefined) {
      stored = JSON.parse(result.blockedURLs);
    }
    blockedURLs = stored;
  })
}

function addBlockedURL(url){
  blockedURLs.push(url);
  setBlockedURLs(blockedURLs);
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

//listener listens for when url is changed
chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    // read changeInfo data
    // console.log(tabId, changeInfo, tab)
    if (tab.url && changeInfo.status == 'complete') { 
      // url has changed; send message to content script
      let responseObj = {
        message: "responseObj",
        isBlocked: isBlocked(tab.url),
        redirectURL: redirectURL,
        originalURL: tab.url,
        blockedURLs: JSON.stringify(blockedURLs)

      };
      chrome.tabs.sendMessage(tabId, responseObj);
    }
  }
);

//handle messages from other scripts 
chrome.runtime.onMessage.addListener(function(response, sender, sendResponse){
	if(sender.tab){ //message from New Tab
    let responseObj = {
      message: "responseObj",
      isBlocked: isBlocked(sender.tab.url),
      redirectURL: redirectURL,
      originalURL: sender.tab,
      blockedURLs: JSON.stringify(blockedURLs)
    };
    sendResponse(responseObj);
	} else { // message from popup.html
    if(response.redirectURL){
      setRedirectURL(response.redirectURL);
    } else {
      addBlockedURL(response.blockedURL);
    }
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
