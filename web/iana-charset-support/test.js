function report(iframe, testcharset, groupId) {
  var framecharset = "";
  var match = false;
  numtests_complete++;

  var teststatus = document.getElementById("teststatus");
  teststatus.innerHTML = "Testing " + numtests_complete + " of " + numtests + ": " + testcharset;

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
  var cb = document.getElementById("cb");

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
      result.innerHTML = testcharset + " <span class='testcase'>, " + framecharset + "</span>";
      resultPass.appendChild(result);
      resultPass.appendChild(lbreak);
    }
    // Hide utf-8 fallback from failure results if the button is checked
    else if (!match && !(framecharset.toLowerCase() == "utf-8" && cb.checked)) {
      result.className = "fail";
      result.id = "fail";
      result.innerHTML = testcharset + " <span class='testcase'>, " + framecharset + "</span>";
      resultFail.appendChild(result);
      resultFail.appendChild(lbreak);
    }
    //else {
    //  result.className = "fail";
    //  result.id = "error";
    //  result.innerHTML = testcharset + ", error";
    //  resultErr.appendChild(result);
    //  resultErr.appendChild(lbreak);
    //}
  }
  catch(err) {
    result.className = "fail";
    result.id = "error";
    result.innerHTML = "<span class='testcase'>" + testcharset + ",</span> error: " + err.description;
    resultErr.appendChild(result);
    resultErr.appendChild(lbreak);
  }	

  if (numtests == numtests_complete) {
    teststatus.setAttribute("class","pass");
    teststatus.innerHTML = "All tests complete...!";
  }

}
function testRun(alias, count, groupId) {
  if (count == undefined) count = 0;
  // Create an iframe as the target of testing
  var testzone = document.getElementById("testzone");

  var testframe = document.createElement("iframe");
  testframe.id = "testframe-" + count;
  testframe.setAttribute("onload", "report(this, '" + alias + "', " + groupId + ");");
  testframe.src = "charset.php?alias=" + alias;
  //testframe.contentDocument.location.href = "charset.php?alias=" + alias;
  //testframe.contentDocument.location.reload();
  testzone.appendChild(testframe);
}
function clearResults() {
  var resultPass = document.getElementById("resultPass");
  var resultFail = document.getElementById("resultFail");
  var resultErr = document.getElementById("resultErr");
  // Clear the testzone
  while (resultPass.hasChildNodes()) {
    resultPass.removeChild(resultPass.lastChild);
  }
  while (resultFail.hasChildNodes()) {
    resultFail.removeChild(resultFail.lastChild);
  }
  while (resultErr.hasChildNodes()) {
    resultErr.removeChild(resultErr.lastChild);
  }
}

// Loop through all of the aliases, testing each
function testEncodings() {
  clearResults();
  var count = 0;
  for (var i = 0, l = data.length; i < l; i++) {
    var charset = data[i]
    for (var j = 0, k = charset.labels.length; j < k; j++) {
      count++;
      numtests++;
      testRun(charset.labels[j],count,i);
    }
  }
}

var numtests = 0;
var numtests_complete = 0;
var xhr = new XMLHttpRequest();
xhr.open("GET", "charsets.json", false);
xhr.send(null);

var data = JSON.parse(xhr.responseText);
var aliases = [];

var teststatus = document.getElementById("teststatus");
teststatus.setAttribute("class","fail");
