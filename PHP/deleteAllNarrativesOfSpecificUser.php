<?php
//DB POSTGRES
	
	require('PgConn.php');
	
	//insert user data to delete all his stories
/*   	$user="moving.52";
	$idUs="52"; */  
	
	
	
	
	$arr=[];
	
	$query = "select id, subject, title from narrations where \"user\"= '".$idUs."'";
	$result = pg_query($query) or die('Error message: ' . pg_last_error());
				
	while ($row = pg_fetch_row($result)) {
		array_push($arr,$row);
	}
	pg_free_result($result);


	
	for($i=0; $i < sizeOf($arr); $i++){
		
		
		$sql= "DROP TABLE IF EXISTS \"".$arr[$i][0].$user."-".$arr[$i][1]."\"";
		$result = pg_query($sql) or die('Error message: ' . pg_last_error());
		$rows = pg_num_rows($result);
		
		//$sql= "DELETE FROM narrations WHERE \"id\" = " . $arr[$i][0] . " AND \"user\" = '" . $idUs ."'";
		$sql= "DELETE FROM narrations WHERE \"id\" = " . $arr[$i][0] ;
		$result = pg_query($sql) or die('Error message: ' . pg_last_error());
		$rows = pg_num_rows($result);	
	
		//echo "deleted: " . $arr[$i][2] . " <b>id</b>: " .  $arr[$i][0] . "</br>";
		
		echo 'conn.delete("https://tool.dlnarratives.eu/'.$user.'_N'.$arr[$i][0].'");';
		echo "</br>";
	}
	
	echo "</br></br>ELIMINARE ANCHE GLI ELEMENTI CON QUESTO ID DAL JSON DELLA MAPPA";

	
	


