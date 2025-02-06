
<?php
require('PgConn.php');
	
$info="";
$currentdbname= $_GET['dbusername'];

	//get info (A1)
	$sql= "SELECT value FROM  \"".$currentdbname."\" where id = 'A1'" ;
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());

	
	while ($row=pg_fetch_assoc($result)) {
		$info= $row['value'];
	}
	pg_free_result($result);
	
			// array json
		$arrayJson= array("info"=> $info);	
		$data= json_encode($arrayJson);
		echo $data;