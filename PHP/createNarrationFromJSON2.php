<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

//DB POSTGRES CONN
require('PgConn.php');
	

//EXAMPLE 
/* $user="gianpaolo";
$idUser= "51";
$subjectNarration="q204646";
$titleNarration="Giant Squid";    */


 
	//insert narration in narration table and get id narra
/* 			$sql= "WITH ins AS (INSERT INTO narrations (id_dbname, title, \"user\", subject) VALUES ('".$user."." .$idUser. "-".$subjectNarration."', '".$titleNarration."', '".$idUser."', '".$subjectNarration."') RETURNING id_dbname) select count(*) from ins";
		$result = pg_query($sql) or die('Error message: ' . pg_last_error());
		
		
		pg_free_result($result);
		
		$sql= "SELECT last_value FROM id_narration_seq";
		$result = pg_query($sql) or die('Error message: ' . pg_last_error());
		while ($row = pg_fetch_row($result)) {
			$idNarra=$row[0];
		}
		pg_free_result($result);
	 	
	

$currentdbname= $idNarra.$user.".".$idUser."-".$subjectNarration;	
	
	
	//CREA TABELLA 
	$sql='CREATE TABLE IF NOT EXISTS "'.$currentdbname.'"(
    "id" character(500) primary key,
    "value" jsonb
	);
	';
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());
	pg_free_result($result); */

 
 



// load json
$pathToJson = file_get_contents("../json/bruni.json");
if ($pathToJson === false) {
    echo "NO";
}

$json_a = json_decode($pathToJson, true);
if ($json_a === null) {
   echo "NO2";
}

var_dump($json_a["A1"]["subj"]);


// read json and insert in table
/* 
foreach($json_a as $key => $val) {

	
	$id= $json_a[$key]["_id"];
	$encodedValue= json_encode(($json_a[$key]));
	
	

	
 	$sql2= "INSERT INTO \"".$currentdbname."\" (id, value) 
		VALUES ('" . $id . "', '". pg_escape_string($encodedValue) . "')";
		$result2 = pg_query($sql2) or die('Error message: ' . pg_last_error());	 


}


//update new id and user to the new narration
$userWithId= $user.'.'.$idUser;

$sql= "UPDATE \"" . $currentdbname . "\" SET value= jsonb_set(value, '{id}', '\"$idNarra\"') WHERE id = 'A1'";
$result = pg_query($sql) or die('Error message: ' . pg_last_error());

$sql= "UPDATE \"" . $currentdbname . "\" SET value= jsonb_set(value, '{idNarra}', '\"$idNarra\"') WHERE id = 'A1'";
$result = pg_query($sql) or die('Error message: ' . pg_last_error());

$sql= "UPDATE \"" . $currentdbname . "\" SET value= jsonb_set(value, '{author}', '\"$userWithId\"') WHERE id = 'A1'";
$result = pg_query($sql) or die('Error message: ' . pg_last_error()); */



?>