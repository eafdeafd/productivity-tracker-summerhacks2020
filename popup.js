'use strict';

let website = document.getElementById("website");
let submit = document.getElementById("submit");
let form = document.getElementById("myForm");
let formLabel = document.getElementById("formLabel");

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
		chrome.runtime.sendMessage(newWebsite);
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
