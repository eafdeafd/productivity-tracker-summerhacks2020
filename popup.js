'use strict';

let website = document.getElementById("website");
let submit = document.getElementById("submit");
let form = document.getElementById("myForm");
let formLabel = document.getElementById("formLabel");
let websiteBlock = document.getElementById("websiteBlock");
let submitBlock = document.getElementById("submitBlock");
let formBlock = document.getElementById("myFormBlock");
let formLabelBlock = document.getElementById("formLabelBlock");

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }
  let arr = string.split(".");
  if(arr.length <= 1 || arr[arr.length - 1] == ''){
  	return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

form.onsubmit = function (e){
	e.preventDefault();
	let newWebsite = website.value;
	if(!newWebsite.startsWith("http")){
		newWebsite = "https://" + newWebsite;
	}
	if(isValidHttpUrl(newWebsite)){
		// remove any previous text
		if (formLabel.hasChildNodes()) {
  			formLabel.removeChild(formLabel.childNodes[0]);
		}
		formLabel.style.color = 'black';
		// add text
		let paragraph = document.createElement("p");     
		let textnode = document.createTextNode("Website successfully changed to ");
		// add link
        let a = document.createElement('a');  
        let link = document.createTextNode(newWebsite); 
        a.appendChild(link);  
        a.title = "Redirect URL";  
        a.href = newWebsite;
        // add nodes to formLabel
        paragraph.appendChild(textnode);
        paragraph.appendChild(a);
        formLabel.appendChild(paragraph);
        // reset form 
		website.value = "";
		// send new website to background 
		chrome.runtime.sendMessage({redirectURL: newWebsite});
	}
	else {
		// remove any previous text
		if (formLabel.hasChildNodes()) {
  			formLabel.removeChild(formLabel.childNodes[0]);
		}
		// add error message
		formLabel.innerHTML = "Invalid website, please try again.";
		formLabel.style.color = 'red';
	}
};

formBlock.onsubmit = function (e){
	e.preventDefault();
	let newWebsite = websiteBlock.value;
	if(!newWebsite.startsWith("http")){
		newWebsite = "https://" + newWebsite;
	}
	if(isValidHttpUrl(newWebsite)){
		// remove any previous text
		if (formLabelBlock.hasChildNodes()) {
  			formLabelBlock.removeChild(formLabelBlock.childNodes[0]);
		}
		formLabelBlock.style.color = 'black';
		// add text
		let paragraph = document.createElement("p");     
		let textnode = document.createTextNode(" successfully added to blocked list.");
		// add link
        let a = document.createElement('a');  
        let link = document.createTextNode(newWebsite); 
        a.appendChild(link);  
        a.title = "blocked URL";  
        a.href = newWebsite;
        // add nodes to formLabel
        paragraph.appendChild(a);
        paragraph.appendChild(textnode);
        formLabelBlock.appendChild(paragraph);
        // reset form 
		websiteBlock.value = "";
		// send new website to background
		chrome.runtime.sendMessage({blockedURL: newWebsite});
	}
	else {
		// remove any previous text
		if (formLabelBlock.hasChildNodes()) {
  			formLabelBlock.removeChild(formLabelBlock.childNodes[0]);
		}
		// add error message
		formLabelBlock.innerHTML = "Invalid website, please try again.";
		formLabelBlock.style.color = 'red';
	}
};