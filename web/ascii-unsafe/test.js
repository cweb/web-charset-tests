function getEncoding(alias) {
	var xhr = new XMLHttpRequest();
	// SYNCHRONOUS XHR required!
	xhr.open('GET', "charset.php?alias=" + alias, false);
	xhr.send();

	numtests_complete++;
	var teststatus = document.getElementById("teststatus");
	teststatus.setAttribute("class","fail");
	teststatus.innerHTML = "Testing " + numtests_complete + " of " + numtests;


	var result = document.createElement("span");
	var resultPass = document.getElementById("resultPass");
	var resultFail = document.getElementById("resultFail");
	var resultErr = document.getElementById("resultErr");
	lbreak = document.createElement("br");

 	// Does the alias exist?
	//if(aliases.indexOf(alias) == -1) {
	//  result.className = "fail";
	//  result.innerHTML = alias + ",error: alias not found";
	//  resultErr.appendChild(result);
	//  resultErr.appendChild(lbreak);
	//  return;
	//}

	try {
	  var resp = xhr.responseText;

	  if (resp == " $%'()*+,-./<>:;=") {
	    result.className = "pass";
	    result.id = "pass";
	    result.innerHTML = alias + ", pass";
	    resultPass.appendChild(result);
	    resultPass.appendChild(lbreak);
	  }
	  // Check for replacement chars in the respons,
	  // which mean the conversion failed.
	  else if (resp == "?" || resp == "!" || resp == "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!") {
	    result.className = "fail";
	    result.id = "error";
	    result.innerHTML = alias + ", conversion error";
	    resultErr.appendChild(result);
	    resultErr.appendChild(lbreak);
	  }
	  else if (resp == "not found") {
	    result.className = "fail";
	    result.id = "error";
	    result.innerHTML = alias + ", not found";
	    resultErr.appendChild(result);
	    resultErr.appendChild(lbreak);
	  }
	  else {
	    result.className = "fail";
	    result.id = "fail";
	    result.innerHTML = alias + ", fail";
	    resultFail.appendChild(result);
	    resultFail.appendChild(lbreak);
	  }
	}
	catch(err) {
	  result.className = "fail";
	  result.id = "error";
	  result.innerHTML = alias + ", error: " + err.description;
	  resultErr.appendChild(result);
	  resultErr.appendChild(lbreak);
	}

       var teststatus = document.getElementById("teststatus");
        if (numtests == numtests_complete) {
          teststatus.setAttribute("class","pass");
          teststatus.innerHTML = "All tests complete...!";
        }

}
// Loop through all of the aliases, testing each
function testEncodings() {
  for (var i = 0; i < numtests; i++) {
	var alias = aliases[i];
	getEncoding(alias);
  }
}

var numtests = aliases.length;
var numtests_complete = 0;
