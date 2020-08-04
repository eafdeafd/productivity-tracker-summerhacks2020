

function getRedirectTab(){
	chrome.runtime.sendMessage("get responseObj for Redirect Tab", function(response){
		// add starting text
		let paragraph = document.createElement("p");     
		let textnode = document.createTextNode("When accessing a blocked website, your extension currently redirects to ");
		// add link
        let a = document.createElement('a');  
        let link = document.createTextNode(response.redirectURL); 
        a.appendChild(link);  
        a.title = "Redirect URL";  
        a.href = response.redirectURL;
        // add ending text
        let textnode2 = document.createTextNode(".");
        // append to paragraph
        paragraph.appendChild(textnode);
        paragraph.appendChild(a);
		paragraph.appendChild(textnode2);
		document.getElementById("redirect").appendChild(paragraph);
	});
}

function removeURL(url){
	let responseObj = {
		message: "remove Blocked Tab",
		removeURL: url
	};
	chrome.runtime.sendMessage(responseObj, function(response){location.reload()});
	return true;
}

function getBlockedTabs(){
	chrome.runtime.sendMessage("get responseObj for Blocked Tabs", function(response){
		let list = document.createElement('ul');
		for(let blockedURL of JSON.parse(response.blockedURLs)){
			// add link
			let listItem = document.createElement('li');
	        let a = document.createElement('a');  
	        let link = document.createTextNode(blockedURL);
	        let btn = document.createElement('input');
			btn.type = "button";
			btn.className = "btn";
			btn.value = "Unblock";
			btn.addEventListener("click", function(){removeURL(blockedURL)});
	        a.appendChild(link); 
	        a.title = "blocked URL";  
	        a.href = blockedURL;
	    	// append to list
	    	listItem.appendChild(a);
	    	listItem.appendChild(btn);
	    	list.appendChild(listItem);
	    }
	    let blockedWebsites = document.getElementById("blockedWebsites");
		blockedWebsites.appendChild(list);
	});
}



function getTimer(){
	let timeStart = new Date().getTime();
	// Update the count down every 1 second
	let x = setInterval(function() {
	  // Find the distance between now and the count down date
	  let timeCurrent = new Date().getTime();
	  let distance = timeCurrent - timeStart;
	  // Time calculations for hours, minutes and seconds
	  let hours = Math.floor((distance / (1000 * 60 * 60)));
	  let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	  let seconds = Math.floor((distance % (1000 * 60)) / 1000);
	  // Display the result
	  document.getElementById("clock").innerHTML = hours + "h "
	  + minutes + "m " + seconds + "s ";

	  // If the count down is negative
	  if (distance < 0) {
	    clearInterval(x);
	    document.getElementById("clock").innerHTML = "Error";
	  }
	}, 1000);
}

function clearVisitedURLs(){
	let responseObj = {
		message: "clear visitedURLs"
	};
	chrome.runtime.sendMessage(responseObj, function(response){location.reload()});
	return true;
}

function getVisitedTabs(){
	let visitedWebsites = document.getElementById("visitedWebsites");
	chrome.runtime.sendMessage("get responseObj for Visited Tabs", function(response){
		let list = document.createElement('ul');
		let allVisited = JSON.parse(response.visitedURLs);
		allVisited.sort(function(v1, v2) {return v2[1] - v1[1]});
		for(let visitedURL of allVisited){
			let url = visitedURL[0];
			let time = visitedURL[1];
			// add link
			let listItem = document.createElement('li');
	        let a = document.createElement('a');  
	        let link = document.createTextNode(url);
	        a.appendChild(link); 
	        a.title = "visited URL";  
	        a.href = url;
	        // formate time
			let hours = Math.floor((time / (1000 * 60 * 60)));
			let minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
			let seconds = Math.floor((time % (1000 * 60)) / 1000);
			let timeDisplay = hours + "h " + minutes + "m " + seconds + "s ";
	        // add time
	        let p = document.createElement('p');  
	        let timeNode = document.createTextNode(timeDisplay);
	        p.appendChild(timeNode);
	    	// append to list
	    	listItem.appendChild(a);
	    	listItem.appendChild(p);
	    	list.appendChild(listItem);
	    }
		visitedWebsites.appendChild(list);
		let btn = document.createElement('input');
		btn.type = "button";
		btn.className = "btn";
		btn.value = "Clear History";
		btn.addEventListener("click", function(){clearVisitedURLs()});
		visitedWebsites.appendChild(btn);
	});
}

//chrome.runtime.onMessage.addListener(function(response, sender, sendResponse){location.reload();});
getRedirectTab();
getBlockedTabs();
getVisitedTabs();
getTimer();