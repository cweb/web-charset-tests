<?php

$input = $_GET['alias'];

// _GET removes the +, so add them back. There's probably a better way...
$alias = str_replace(" ", "+", $input);

header('Content-Type: text/html; charset=' . $alias);

echo "X";
?>
