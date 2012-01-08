var engine = null;
if (window.navigator.appName == "Microsoft Internet Explorer")
{
   // This is an IE browser. What mode is the engine in?
   if (document.documentMode) // IE8 or later
      engine = document.documentMode;
   else // IE 5-7
   {
      engine = 5; // Assume quirks mode unless proven otherwise
      if (document.compatMode)
      {
         if (document.compatMode == "CSS1Compat")
            engine = 7; // standards mode
      }
      // There is no test for IE6 standards mode because that mode  
      // was replaced by IE7 standards mode; there is no emulation.
   }
   // the engine variable now contains the document compatibility mode.
   var element = document.getElementById("compatCheck");
   element.innerHTML = "Internet Explorer version: " + engine;
}

