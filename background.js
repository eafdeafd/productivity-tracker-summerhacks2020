'use strict';

let defaultVal = "https://www.google.com";
let redirectURL = undefined;
updateRedirectURL();
let blockedURLs = [];
updateBlockedURLs();
let visitedURLs = [];
updateVisitedURLs();

function setRedirectURL(url){
  chrome.storage.sync.set({"redirectURL": url}, function() {
    console.log("Set redirectURL to ", url);
    updateRedirectURL();
  });
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
    updateBlockedURLs();
  });
}

function updateBlockedURLs(){
  let stored = [];
  chrome.storage.sync.get(["blockedURLs"], function(result) {
    if (result.blockedURLs !== undefined) {
      stored = JSON.parse(result.blockedURLs);
    }
    blockedURLs = stored;
  })
}

function setVisitedURLs(listVisited){
  chrome.storage.sync.set({"visitedURLs": JSON.stringify(listVisited)}, function() {
    console.log("Set visitedURLs to ", listVisited);
  });
}

function updateVisitedURLs(){
  let stored = [];
  // get visited URL's from storage
  chrome.storage.sync.get(["visitedURLs"], function(result) {
    if (result.visitedURLs !== undefined) {
      stored = JSON.parse(result.visitedURLs);
    }
    visitedURLs = stored;
    console.log("only stored", visitedURLs);
    // get visited URL's from current window
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      if(tabs[0].url !== "" && visitedURLs.indexOf(tabs[0].url) === -1){
        visitedURLs.push(tabs[0].url); 
      }
      setVisitedURLs(visitedURLs);
    });
  });
}

function clearVisitedURLs(){
  setVisitedURLs([]);
  visitedURLs = [];
}

function addBlockedURL(url){
  if(blockedURLs.indexOf(url) === -1){
    blockedURLs.push(url);
    setBlockedURLs(blockedURLs);
    return "added to list";
  } else {
    return "url already in list";
  }
}

function removeBlockedURL(url){
  let index = blockedURLs.indexOf(url);
  console.log(url, index);
  if(index !== -1){
    blockedURLs.splice(index, 1);
    setBlockedURLs(blockedURLs);
  }
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
      // update visited windows
    }
  }
);

//listens for when active window changes
chrome.tabs.onActivated.addListener(
  function(tabId, changeInfo, tab) {
    updateVisitedURLs();
  }
);

//handle messages from other scripts 
chrome.runtime.onMessage.addListener(function(response, sender, sendResponse){
	if(sender.tab){ //message from New Tab
    if(response.message === "remove Blocked Tab"){
      removeBlockedURL(response.removeURL);
      sendResponse("URL removed");
    }
    else if (response.message === "clear visitedURLs"){
      clearVisitedURLs();
      sendResponse("visitedURLs cleared");
    }
    else { // get blocked tabs
      let responseObj = {
        message: "responseObj",
        isBlocked: isBlocked(sender.tab.url),
        redirectURL: redirectURL,
        originalURL: sender.tab,
        blockedURLs: JSON.stringify(blockedURLs),
        visitedURLs: JSON.stringify(visitedURLs)
      };
      sendResponse(responseObj);
    }
	} else { // message from popup.html
    if(response.redirectURL){ // message from redirectURL form 
      setRedirectURL(response.redirectURL);
    } else {
      if(addBlockedURL(response.blockedURL) === "url already in list"){
        let responseObj = {
          message: "url already in list"
        };
        sendResponse(responseObj);
      } else {
        let responseObj = {
          message: "url added to list"
        };
        sendResponse(responseObj);
      }
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
