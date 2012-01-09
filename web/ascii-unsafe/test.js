function getEncoding(alias) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', "charset.php?alias=" + alias, true);

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {

      var teststatus = document.getElementById("teststatus");
      if (numtests != -1)
      {
        numtests_complete++;
        teststatus.setAttribute("class","fail");
        teststatus.innerHTML = "Testing " + numtests_complete + " of " + numtests + 
          ": " + alias;
      }

      var result = document.createElement("span");
      var resultPass = document.getElementById("resultPass");
      var resultFail = document.getElementById("resultFail");
      var resultErr = document.getElementById("resultErr");
      lbreak = document.createElement("br");

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

      if (numtests == numtests_complete && numtests != -1) {
        teststatus.setAttribute("class","pass");
        teststatus.innerHTML = "All tests complete...!";
      }

    }
  }
  xhr.send();
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

  numtests = aliases.length;
  numtests_complete = 0;
  clearResults();
  for (var i = 0; i < numtests; i++) {
    var alias = aliases[i];
    getEncoding(alias);
  }
}

var numtests = -1;
var numtests_complete = 0;
