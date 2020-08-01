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
		document.body.appendChild(paragraph)
	});
}

function getBlockedTabs(){
	chrome.runtime.sendMessage("get responseObj for Blocked Tabs", function(response){
		let list = document.createElement('ul');
		for(let blockedURL of response.blockedURLs){
			// add link
			let listItem = document.createElement('li');
	        let a = document.createElement('a');  
	        let link = document.createTextNode(blockedURL); 
	        a.appendChild(link); 
	        a.title = "blocked URL";  
	        a.href = blockedURL;
        	// append to list
        	listItem.appendChild(a);
        	list.appendChild(listItem);
        }
        let blockedWebsites = document.getElementById("blockedWebsites");
		blockedWebsites.appendChild(list);
	});
}

getRedirectTab();
getBlockedTabs();