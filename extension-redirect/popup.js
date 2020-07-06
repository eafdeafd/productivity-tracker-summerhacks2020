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
		formLabel.style.color = 'black';
		formLabel.innerHTML = "Website successfully changed to " + newWebsite;
		website.value = "";
		chrome.runtime.sendMessage(newWebsite);
	}
	else {
		formLabel.innerHTML = "Invalid website, please try again.";
		formLabel.style.color = 'red';
	}
};
