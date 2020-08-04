
let buttonBlock = document.getElementById("buttonBlock");
let buttonRedirect = document.getElementById("buttonRedirect");
let buttonWeb = document.getElementById("buttonWeb");
let buttonURL = document.getElementById("buttonURL");
let redirect = document.getElementById("redirect");
let blockedWebsites = document.getElementById("blockedWebsites");
let clock = document.getElementById("clock");
let visitedWebsites = document.getElementById("visitedWebsites");
let visitedURLs = document.getElementById("visitedURLs");

buttonBlock.addEventListener("click", function(){
	redirect.style.display = 'none';
	blockedWebsites.style.display = 'block';
	clock.style.display = 'none';
	visitedWebsites.style.display = 'none';
	visitedURLs.style.display = 'none';
});

buttonRedirect.addEventListener("click", function(){
	redirect.style.display = 'block';
	blockedWebsites.style.display = 'none';
	clock.style.display = 'none';
	visitedWebsites.style.display = 'none';
	visitedURLs.style.display = 'none';
});

buttonWeb.addEventListener("click", function(){
	redirect.style.display = 'none';
	blockedWebsites.style.display = 'none';
	clock.style.display = 'none';
	visitedWebsites.style.display = 'block';
	visitedURLs.style.display = 'none';
});

buttonURL.addEventListener("click", function(){
	redirect.style.display = 'none';
	blockedWebsites.style.display = 'none';
	clock.style.display = 'none';
	visitedURLs.style.display = 'block';
	visitedWebsites.style.display = 'none';
});

function getRedirectTab(){
	let cardHead = document.getElementById("cardHead");
	let cardBody = document.getElementById("cardBody");
	  //  <iframe src="page1.html" name="targetframe" allowTransparency="true" scrolling="no" frameborder="0" >
	chrome.runtime.sendMessage("get responseObj for Redirect Tab", function(response){
		// add starting text    
		let textnode = document.createTextNode("Your extension currently redirects to ");
		// add link
        let a = document.createElement('a');  
        let link = document.createTextNode(response.redirectURL); 
        a.appendChild(link);  
        a.title = "Redirect URL";  
        a.href = response.redirectURL;
        // add ending text
        let textnode2 = document.createTextNode(".");
        // append to card
        cardHead.appendChild(textnode);
        cardHead.appendChild(a);
        cardHead.appendChild(textnode2);

        //add iframe
        let iframe = document.createElement('iframe');
        iframe.src = response.redirectURL;
        iframe.name = "redirect URL frame"; 
        iframe.title = "iframe for redirect URL";
        iframe.style.border = 'none';
        iframe.style.height = '100%';
        iframe.style.width = '100%';
        cardBody.appendChild(iframe);
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
	  clock.innerHTML = hours + "h "
	  + minutes + "m " + seconds + "s ";

	  // If the count down is negative
	  if (distance < 0) {
	    clearInterval(x);
	    clock.innerHTML = "Error";
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

function condenseResults(listVisited){
	let dictVisited = new Map();
	for(let visitedURL of listVisited){
		let url = new URL(visitedURL[0]);
		let domain = url.hostname;
		// get rid of pre/suffix
		if(domain.startsWith("www.")){
			domain = domain.substring(4);
		}
		if(domain.endsWith(".edu") || domain.endsWith(".net") || domain.endsWith(".com") || domain.endsWith(".org")){
			domain = domain.substring(0, domain.length - 4);
		}

		if(domain.trim() === ""){
			domain = "Other";
		}

		// capitalize
		domain = domain.split(".");
		for(let i = 0; i < domain.length; i++){
			domain[i] = domain[i].charAt(0).toUpperCase() + domain[i].slice(1);
		}

		//join 
		domain = domain.join(" ");

		
		if(dictVisited.has(domain)){
			dictVisited.set(domain, dictVisited.get(domain) + visitedURL[1]);
		} else {
			dictVisited.set(domain, visitedURL[1]);
		}
	}
	let allVisited = [];
	for(let key of dictVisited.keys()){
		allVisited.push([key, dictVisited.get(key)]);
	}
	allVisited.sort(function(v1, v2) {return v2[1] - v1[1]});
	return allVisited;
}

function getVisitedTabsCondensed(){
	chrome.runtime.sendMessage("get responseObj for Visited Tabs", function(response){
		let list = document.createElement('ul');
		let allVisited = JSON.parse(response.visitedURLs);
		allVisited = condenseResults(allVisited);
		for(let visitedURL of allVisited){
			let url = visitedURL[0];
			let time = visitedURL[1];
			// add link
			let listItem = document.createElement('li');
	        let websiteP = document.createElement('p');  
	        let link = document.createTextNode(url);
	        websiteP.appendChild(link); 
	        // format time
			let hours = Math.floor((time / (1000 * 60 * 60)));
			let minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
			let seconds = Math.floor((time % (1000 * 60)) / 1000);
			let timeDisplay = hours + "h " + minutes + "m " + seconds + "s ";
	        // add time
	        let p = document.createElement('p');  
	        let timeNode = document.createTextNode(timeDisplay);
	        p.appendChild(timeNode);
	    	// append to list
	    	listItem.appendChild(websiteP);
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

function getVisitedTabs(){
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
	        // format time
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
		visitedURLs.appendChild(list);
		let btn = document.createElement('input');
		btn.type = "button";
		btn.className = "btn";
		btn.value = "Clear History";
		btn.addEventListener("click", function(){clearVisitedURLs()});
		visitedURLs.appendChild(btn);
	});
}



getRedirectTab();
getBlockedTabs();
getVisitedTabsCondensed();
getVisitedTabs();
getTimer();