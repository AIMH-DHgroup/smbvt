<?php
require('PgConn.php');
	
$user= $_GET['user'];
$id= $_GET['id'];

$link="../owl/narratives/".$user."_N".$id.".owl";

if (file_exists($link)) {
	$itExists=1;
} else {
   $itExists=0;
}

	// array json
	$arrayJson= array("fileExists"=> $itExists);	
	$data= json_encode($arrayJson);
	echo $data;
?>