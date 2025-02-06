<?php
//DB POSTGRES
	
	require('PgConn.php');
	
	//insert users data
/* 	$user="moving.52";
	$idUs="52"; */
	
	//insert idNarras to delete
	//$id=["318","317","316","314"];
	
	for($i=0; $i < sizeOf($id); $i++){

		$query = "select id, subject, title from narrations where \"id\"= ".$id[$i]." AND \"user\"= '".$idUs."'";
		$result = pg_query($query) or die('Error message: ' . pg_last_error());
		
 		while ($row = pg_fetch_row($result)) {
			
 			$sql= "DROP TABLE IF EXISTS \"".$row[0].$user."-".$row[1]."\"";
			$result = pg_query($sql) or die('Error message: ' . pg_last_error());
			$rows = pg_num_rows($result);
			
			//$sql= "DELETE FROM narrations WHERE \"id\" = " . $row[0] . " AND \"user\" = '" . $idUs ."'";
			$sql= "DELETE FROM narrations WHERE \"id\" = " . $row[0];
			$result = pg_query($sql) or die('Error message: ' . pg_last_error());
			$rows = pg_num_rows($result);
			
			
			//echo "deleted: " . $row[2] . " <b>id</b>: " .  $row[0] . "</br>"; 
			echo 'conn.delete("https://tool.dlnarratives.eu/'.$user.'_N'.$row[0].'");';
			echo "</br>";
		}	 
	}
	
	pg_free_result($result);
	
	echo "</br></br>ELIMINARE ANCHE GLI ELEMENTI CON QUESTO ID DAL JSON DELLA MAPPA";


	


	
	


