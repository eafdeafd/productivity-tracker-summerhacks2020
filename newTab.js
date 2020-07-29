function getRedirectTab(){
	chrome.runtime.sendMessage("", function(response){
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

getRedirectTab();