<?php
include "aliases.php";

$input = $_GET['alias'];

// _GET removes the +, so add them back. There's probably a better way...
$alias = str_replace(" ", "+", $input);

// Check if the alias exists in the array of pre-defined aliases
//if (preg_grep("/" . $alias . "/i", $aliases) != NULL) {
if (in_array($alias, $aliases)) {
  // The alias shoudl be safe at this point, or could something go wrong?
  $file = "tc/" . strtolower($alias);
  if (!file_exists($file)) {
    die("alias " . $alias . " does not exist");
  }
  else {
    header('Content-Type: text/plain; charset=' . $alias);
    header('Content-Length: '.filesize($file));
    include($file);
  }
}

else {
  die("not found");
}


?>
