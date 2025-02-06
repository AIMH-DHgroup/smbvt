<?php
require('PgConn.php');

$table='"2664giulia.56-q16617548"';



$query = "SELECT value FROM ".$table." where id ~ '^ev' ORDER BY (value->>'position')::int;";
$events=[];

$result = pg_query($query) or die('Error message: ' . pg_last_error());


while ($row=pg_fetch_assoc($result)) {

	$eventJson = json_decode($row['value']);   
	$description= $eventJson->description;
	array_push($events,Strip_tags($description));
	
	
}



// CSV
$fp = fopen("aaa.csv", 'w'); 
  
// Loop through file pointer and a line 
foreach ($events as $fields) {

    fputcsv($fp, array(strip_tags($fields))); 
} 
  
fclose($fp); 