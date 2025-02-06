

<?php
//DB POSTGRES
require('PgConn.php');

$slides= $_POST['slides'];
$user= $_POST['user'];
$title= $_POST['narrationTitle'];
$id_nar= $_POST['idNarr']; 
$subjectNarration= $_POST['subject'];
$baseUrl= $_POST['baseURL'];


//////////////Triplify////////////

	$date = new DateTime();
	
	$events=[];
	$entitys=[];
	$info="";
	$currentdbname= $id_nar . $user . "-" . strtolower($subjectNarration);
	
	$start= $date->getTimestamp();

	//get events
	$sql= "SELECT id, value FROM \"".$currentdbname."\" where id ~ '^ev'";
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());


	while ($row=pg_fetch_assoc($result)) {
		//array_push($events, json_decode($row['value']));
		$events[str_replace(" ","",$row['id'])] =  json_decode($row['value']);
	}
	pg_free_result($result);
	
	
	//get entitys
	$sql= "SELECT id, value FROM \"".$currentdbname."\" where id ~ '^Q' or id ~ '^U'" ;
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());
	
	while ($row=pg_fetch_assoc($result)) {
		//array_push($entitys, json_decode($row['value']));
		$entitys[str_replace(" ","",$row['id'])] =  json_decode($row['value']);
	}
	pg_free_result($result);
	

	//get info (A1)
	$sql= "SELECT value FROM \"".$currentdbname."\" where id = 'A1'" ;
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());
	
	while ($row=pg_fetch_assoc($result)) {
		$info= json_decode($row['value']);
	}
	pg_free_result($result);
	
	// choose fuseki dataset and folder to dave owl files
	if(isset($_SESSION['Demon_on'])){
		$datasetFs= "https://tool.dlnarratives.eu/fuseki/prova2";
		$datasetName= "prova2";
		$folderSaveOwl="prova2/";
	} else {
		die("not demo session");
	}
	
	// force dataset
/* 	$datasetFs= "https://tool.dlnarratives.eu/fuseki/Narration2";
	$datasetName= "Narration2";
	$folderSaveOwl="Narration2/"; */
	
	// create json object
	//header('Content-Type: application/json');
	$results = array("entities"=> $entitys, "narra"=> $info, "events"=> $events);
	$dataJson = json_encode($results);

	
	//create jsonFile to pass at jar file
	//$myfile = fopen("/var/www/tool.dlnarratives.eu/owl/" . $currentdbname . ".json", "w+") or die("Unable to open file!");
	$myfile = fopen("/tmp/" . $currentdbname . ".json", "w+") or die("Unable to open file!");
	fwrite($myfile, $dataJson);
	fclose($myfile);
	
	
	//create owl file  ProvaJv
	//$path = "/usr/local/etc/selfservice/";
	$path = "../Triplify/";
	chdir($path);
	
	
	
	//exect jar file and disply eventual errors
	error_reporting(E_ALL);

	$cmd = "java -jar " . $path . "triplify.jar /tmp/" . $currentdbname . ".json /var/www/tool.dlnarratives.eu/owl/".$folderSaveOwl.$user. "_N" . $id_nar .".owl ".$datasetFs." 2>&1";

	$output=null;
	$retval=null;
	exec($cmd,$output,$retval);
	//echo "Returned with status $retval and output:\n";
	//print_r($output);  // TO SEE ALL JAVA OUTPUT (ERROR)



	$end= $date->getTimestamp();
	
/* 		// array json
		$arrayJson= array( "id" => $output, "numberEvents" => $output[1], "consistent" => $output[5], "pathFileOwl" => "../owl/".explode("-", $currentdbname)[0]. "_" . $_POST['idNarration'] .".owl");	
		$data= json_encode($arrayJson);
		echo $data; */

chmod("/var/www/tool.dlnarratives.eu/owl/".$folderSaveOwl.$user. "_N" . $id_nar .".owl", 0777);



// array json
		$arrayJson= array( "msg" => $slides, "link" => '', "output" => $output);		
		$data= json_encode($arrayJson);
		echo $data;
?>