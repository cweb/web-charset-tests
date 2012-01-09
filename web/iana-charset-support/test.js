function report(iframe, testcharset, groupId) {
	var framecharset = "";
	var match = false;

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

	// Check if the frame's charset and the test case charset
	// both exist in the same group.  If so consider them a match
	// since they're aliases for one another.
	if (groupId == null) {
	// A special case required for when a single user-initiated test
	// is run.
	  var label = "";
	  var framecharsetId = -1;
	  var testcharsetId = -2;

  	  for (var i = 0, l = data.length; i < l; i++) {
	    for (var j = 0, jl = data[i].labels.length; j < jl; j++) {
    	      label = data[i].labels[j];

	      if (framecharset.toLowerCase() == label.toLowerCase()) 
	        framecharsetId = i;
	
	      if (testcharset.toLowerCase() == label.toLowerCase()) 
	        testcharsetId = i;
	    }
	    if (framecharsetId == testcharsetId) {
	      match = true;
	      // Match was found in the group so exit!
	      break;
	    }
	    else match = false;
    	  }

	}
	// Otherwise all tests are being run.
	else {
  	  for (var i = 0, l = data[groupId].labels.length; i < l; i++) {
    	    var label = data[groupId].labels[i]
	    if (framecharset.toLowerCase() == label.toLowerCase()) {
	      match = true;
	      // Match was found in the group so exit!
	      break;
	    }
	    else match = false;
    	  }
	}
  	
        try {

          if (match) {
            result.className = "pass";
            result.id = "pass";
            result.innerHTML = "test: " + testcharset + ", result: " + framecharset + ", pass";
            resultPass.appendChild(result);
            resultPass.appendChild(lbreak);
          }
          else if (!match) {
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
function testRun(alias, id, groupId) {
	if (id == undefined) id = 0;
	// Create an iframe as the target of testing
	var testzone = document.getElementById("testzone");

	var testframe = document.createElement("iframe");
	testframe.id = "testframe-" + id;
	testframe.setAttribute("onload", "report(this, '" + alias + "', " + groupId + ");");
	testframe.src = "charset.php?alias=" + alias;
	//testframe.contentDocument.location.href = "charset.php?alias=" + alias;
	//testframe.contentDocument.location.reload();
	testzone.appendChild(testframe);
}

// Loop through all of the aliases, testing each
function testEncodings() {
  for (var i = 0, l = data.length; i < l; i++) {
    var charset = data[i]
    for (var j = 0, k = charset.labels.length; j < k; j++) {
      testRun(charset.labels[j],j,i);
    }
  }
}

var xhr = new XMLHttpRequest();
xhr.open("GET", "charsets.json", false);
xhr.send(null);

var data = JSON.parse(xhr.responseText);
var aliases = [];
