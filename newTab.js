function getRedirectTab(){
	chrome.runtime.sendMessage("", function(response){
		let paragraph = document.createElement("p");     
		var textnode = document.createTextNode(`When accessing a blocked website, your extension currently redirects to ${response.url}.`);
		paragraph.appendChild(textnode);
		document.body.appendChild(paragraph)
	});
}
getRedirectTab();