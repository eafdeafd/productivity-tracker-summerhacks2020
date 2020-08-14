
let buttonBlock = document.getElementById("buttonBlock");
let buttonRedirect = document.getElementById("buttonRedirect");
let buttonWeb = document.getElementById("buttonWeb");
let buttonURL = document.getElementById("buttonURL");
let title = document.getElementById("title");
let redirect = document.getElementById("redirect");
let blockedWebsites = document.getElementById("blockedWebsites");
let clock = document.getElementById("clock");
let visitedWebsites = document.getElementById("visitedWebsites");
let visitedURLs = document.getElementById("visitedURLs");

title.addEventListener("click", function(){
	redirect.style.display = 'block';
	blockedWebsites.style.display = 'block';
	clock.style.display = 'block';
	visitedWebsites.style.display = 'block';
	visitedURLs.style.display = 'block';
});

buttonBlock.addEventListener("click", function(){
	displayOnlyBlock();
});

function displayOnlyBlock(){
	redirect.style.display = 'none';
	blockedWebsites.style.display = 'block';
	clock.style.display = 'none';
	visitedWebsites.style.display = 'none';
	visitedURLs.style.display = 'none';
}

buttonRedirect.addEventListener("click", function(){
	redirect.style.display = 'block';
	blockedWebsites.style.display = 'none';
	clock.style.display = 'none';
	visitedWebsites.style.display = 'none';
	visitedURLs.style.display = 'none';
});

buttonWeb.addEventListener("click", function(){
	getVisitedTabsCondensed();
	redirect.style.display = 'none';
	blockedWebsites.style.display = 'none';
	clock.style.display = 'none';
	visitedWebsites.style.display = 'block';
	visitedURLs.style.display = 'none';
});

buttonURL.addEventListener("click", function(){
	getVisitedTabs();
	redirect.style.display = 'none';
	blockedWebsites.style.display = 'none';
	clock.style.display = 'none';
	visitedURLs.style.display = 'block';
	visitedWebsites.style.display = 'none';
});

function getRedirectTab(){
	let cardHead = document.getElementById("cardHead2");
	let cardBody = document.getElementById("cardBody2");
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

        // //add iframe
        // let iframe = document.createElement('iframe');
        // iframe.src = response.redirectURL;
        // iframe.name = "redirect URL frame"; 
        // iframe.title = "iframe for redirect URL";
        // iframe.style.border = 'none';
        // iframe.style.height = '100%';
        // iframe.style.width = '100%';
        // cardBody.appendChild(iframe);
	});
}

function removeURL(url){
	let responseObj = {
		message: "remove Blocked Tab",
		removeURL: url
	};
	chrome.runtime.sendMessage(responseObj, function(response){
		getBlockedTabs();
	});
	return true;
}

function getBlockedTabs(){
	let table = document.getElementById("tableBody1");
	table.innerHTML = "";
	chrome.runtime.sendMessage("get responseObj for Blocked Tabs", function(response){
		let listBlocked = JSON.parse(response.blockedURLs);
		listBlocked.sort();
		if(listBlocked.length == 0){
			document.getElementById("cardHead1").innerHTML = "No websites are currently blocked";
			document.getElementById("cardBody1").innerHTML = "";
		}
		for(let blockedURL of listBlocked){
			let row = document.createElement('tr');
			let data = document.createElement('td');
			let data2 = document.createElement('td');
			// add link
	        let a = document.createElement('a');  
	        let link = document.createTextNode(blockedURL);
	        a.title = "blocked URL";  
	        a.href = blockedURL;
	        a.appendChild(link);
	        
	        // add button 
	        let btn = document.createElement('input');
			btn.type = "button";
			btn.className = "btn btn-light";
			btn.value = "Unblock";
			btn.addEventListener("click", function(){
				removeURL(blockedURL);
			});
	        
	    	// append to list
	    	data.appendChild(a);
	    	data2.appendChild(btn);
	    	row.appendChild(data);
	    	row.appendChild(data2);
	    	table.appendChild(row);
	    }
		
	});
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
	let table = document.getElementById("tableBody3");
	let cardFooter3 = document.getElementById("cardFooter3");
	//reset contents
	table.innerHTML = "";
	cardFooter3.innerHTML = "";
	chrome.runtime.sendMessage("get responseObj for Visited Tabs", function(response){
		let allVisited = JSON.parse(response.visitedURLs);
		allVisited = condenseResults(allVisited);
		for(let visitedURL of allVisited){
			let row = document.createElement('tr');
			let data = document.createElement('td');
			let data2 = document.createElement('td');
			let url = visitedURL[0];
			let time = millisToString(visitedURL[1]);
			// add domain
	        let websiteP = document.createElement('p');  
	        let name = document.createTextNode(url);
	        websiteP.appendChild(name);
	        // add time
	        let timeP = document.createElement('p');  
	        let timeNode = document.createTextNode(time);
	        timeP.appendChild(timeNode);
	    	// append to list
	    	data.appendChild(websiteP);
	    	data2.appendChild(timeP);
	    	row.appendChild(data);
	    	row.appendChild(data2);
	    	table.append(row);
	    }

		let btn = document.createElement('input');
		btn.type = "button";
		btn.className = "btn btn-light";
		btn.value = "Clear History";
		btn.addEventListener("click", function(){clearVisitedURLs()});
		cardFooter3.appendChild(btn);
	});
}

function getVisitedTabs(){
	let table = document.getElementById("tableBody4");
	let cardFooter4 = document.getElementById("cardFooter4");
	//reset contents
	table.innerHTML = "";
	cardFooter4.innerHTML = "";
	chrome.runtime.sendMessage("get responseObj for Visited Tabs", function(response){
		let list = document.createElement('ul');
		let allVisited = JSON.parse(response.visitedURLs);
		allVisited.sort(function(v1, v2) {return v2[1] - v1[1]});
		for(let visitedURL of allVisited){
			let row = document.createElement('tr');
			let data = document.createElement('td');
			let data2 = document.createElement('td');
			let url = visitedURL[0];
			let time = millisToString(visitedURL[1]);
			// add domain
	        let websiteP = document.createElement('a');  
	        let name = document.createTextNode(url);
	        websiteP.href = url;
	        websiteP.className = "small";
	        websiteP.appendChild(name);
	        // add time
	        let timeP = document.createElement('p');  
	        let timeNode = document.createTextNode(time);
	        timeP.appendChild(timeNode);
	    	// append to list
	    	data.appendChild(websiteP);
	    	data2.appendChild(timeP);
	    	row.appendChild(data);
	    	row.appendChild(data2);
	    	table.append(row);
	    }
		let btn = document.createElement('input');
		btn.type = "button";
		btn.className = "btn";
		btn.value = "Clear History";
		btn.addEventListener("click", function(){clearVisitedURLs()});
		cardFooter4.appendChild(btn);
	});
}

function millisToString(time){
    // format time
	let hours = Math.floor((time / (1000 * 60 * 60)));
	let minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
	let seconds = Math.floor((time % (1000 * 60)) / 1000);
	let timeDisplay = hours + "h " + minutes + "m " + seconds + "s ";
	return timeDisplay;
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

getRedirectTab();
getBlockedTabs();
getVisitedTabsCondensed();
getVisitedTabs();
// getTimer();