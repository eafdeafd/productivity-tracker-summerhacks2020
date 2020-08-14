'use strict';

let defaultVal = "https://www.bing.com";
let redirectURL = [];
updateRedirectURL();
let blockedURLs = [];
updateBlockedURLs();
let visitedURLs = [];
updateVisitedURLs(true);
let prevIndex = -1;
let prevTime = new Date().getTime();

function setRedirectURL(url){
  chrome.storage.sync.set({"redirectURL": url}, function() {
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
  chrome.storage.local.set({"visitedURLs": JSON.stringify(listVisited)}, function() {});
}

function indexOfURL(url){
  for(let i = 0; i < visitedURLs.length; i++){
    if(visitedURLs[i][0] === url){
      return i;
    }
  }
  return -1;
}

function timeLap(){
  let currentTime = new Date().getTime();
  let timeDiff = currentTime - prevTime;
  prevTime = currentTime;
  return timeDiff;
}

function updateVisitedURLs(getStorage){
  let stored = [];
  // get visited URL's from storage
  if(getStorage){
      chrome.storage.local.get(["visitedURLs"], function(result) {
      if (result.visitedURLs !== undefined) {
        stored = JSON.parse(result.visitedURLs);
      }
      visitedURLs = stored;
      // get visited URL's from current window
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        if(tabs[0].url !== ""){
          let index = indexOfURL(tabs[0].url);
          if(index === -1){
            visitedURLs.push([tabs[0].url, 0]);
          }
          if(prevIndex > -1 && prevIndex < visitedURLs.length){
            visitedURLs[prevIndex][1] += timeLap();
          }
          // store prevIndex
          prevIndex = indexOfURL(tabs[0].url);
        }
        setVisitedURLs(visitedURLs);
      });
    });
  } else {
    // get visited URL's from current window
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      if(tabs[0].url !== ""){
        let index = indexOfURL(tabs[0].url);
        if(index === -1){
          visitedURLs.push([tabs[0].url, 0]);
        }
        if(prevIndex > -1 && prevIndex < visitedURLs.length){
          visitedURLs[prevIndex][1] += timeLap();
        }
        // store prevIndex
        prevIndex = indexOfURL(tabs[0].url);
      }
      setVisitedURLs(visitedURLs);
    });
  }
}

function clearVisitedURLs(){
  setVisitedURLs([]);
  visitedURLs = [];
  timeLap();
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
  if(index !== -1){
    blockedURLs.splice(index, 1);
    setBlockedURLs(blockedURLs);
  }
}

function isBlocked(url){
  for(let blocked of blockedURLs){
    if(url.startsWith(blocked)){
      return true;
    }
  }
  return false;
}

//listener listens for when url is changed
chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    // read changeInfo data
    if (tab.url && changeInfo.status == 'complete') { 
      // url has changed; send message to content script
      let responseObj = {
        message: "responseObj",
        isBlocked: isBlocked(tab.url),
        redirectURL: redirectURL,
        originalURL: tab.url,
        blockedURLs: JSON.stringify(blockedURLs)
      };
      if(isBlocked(tab.url)){
        chrome.tabs.update(tabId, {muted: true});
        chrome.tabs.sendMessage(tabId, responseObj);
      }
      // update visited windows
      updateVisitedURLs(true);
    }
  }
);

chrome.tabs.onActivated.addListener(function(tabId, changeInfo, tab) {
  // update visited windows
  updateVisitedURLs(true);
});

//handle messages from other scripts 
chrome.runtime.onMessage.addListener(function(response, sender, sendResponse){
	if(sender.tab){ //message from New Tab
    updateVisitedURLs(false);
    if(response.message === "remove Blocked Tab"){
      removeBlockedURL(response.removeURL);
      sendResponse("URL removed");
    }
    else if (response.message === "clear visitedURLs"){
      clearVisitedURLs();
      sendResponse("visitedURLs cleared");
    }
    else { // get blocked/visited tabs
      let responseObj = {
        message: "responseObj",
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
