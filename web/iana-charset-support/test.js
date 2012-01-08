function report(iframe, testcharset) {
	if (iframe.contentDocument.charset) {
	  framecharset = iframe.contentDocument.charset;
	}
	else {
	  framecharset = iframe.contentDocument.characterSet;
	}
        var result = document.createElement("span");
        var resultPass = document.getElementById("resultPass");
        var resultFail = document.getElementById("resultFail");
        var resultErr = document.getElementById("resultErr");
        var lbreak = document.createElement("br");

        try {

          if (framecharset.toLowerCase() == testcharset.toLowerCase()) {
            result.className = "pass";
            result.id = "pass";
            result.innerHTML = "test: " + testcharset + ", result: " + framecharset + ", pass";
            resultPass.appendChild(result);
            resultPass.appendChild(lbreak);
          }
          else if (framecharset.toLowerCase() != testcharset.toLowerCase()) {
            result.className = "fail";
            result.id = "fail";
            result.innerHTML = "test: " + testcharset + ", result: " + framecharset + ", fail";
            resultFail.appendChild(result);
            resultFail.appendChild(lbreak);
          }
          else {
            result.className = "fail";
            result.id = "error";
            result.innerHTML = testcharset + ", error";
            resultErr.appendChild(result);
            resultErr.appendChild(lbreak);
          }
        }
        catch(err) {
          result.className = "fail";
          result.id = "error";
          result.innerHTML = testcharset + ", error: " + err.description;
          resultErr.appendChild(result);
          resultErr.appendChild(lbreak);
        }	
}
function testRun(alias, id) {
	if (id == undefined) id = 0;
	// Create an iframe as the target of testing
	var testzone = document.getElementById("testzone");

	var testframe = document.createElement("iframe");
	testframe.id = "testframe-" + id;
	testframe.setAttribute("onload", "report(this, '" + alias + "');");
	testframe.src = "charset.php?alias=" + alias;
	//testframe.contentDocument.location.href = "charset.php?alias=" + alias;
	//testframe.contentDocument.location.reload();
	testzone.appendChild(testframe);
}

// Loop through all of the aliases, testing each
function testEncodings() {
  for (var i = 0; i < aliases.length; i++) {
	var alias = aliases[i];
	testRun(alias, i);
  }
}

