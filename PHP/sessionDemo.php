
<?php


//DB POSTGRES
require('../../../try/PgConnDemo.php');


session_start();// Starting Session


if(!isset($_SESSION['Demon_on'])){
	
	// select last demo user in db
	$query= 'SELECT username, id FROM "public"."users" ORDER BY id DESC LIMIT 1';
	$result = pg_query($query) or die('Error message: ' . pg_last_error());
	while ($row = pg_fetch_row($result)) {
		$idUser=$row[1];
		$username= trim($row[0]);
	}	
	pg_free_result($result);
	
	$progressiveId= $idUser + 1;
	// register new progressive demo user
	$sql= "INSERT INTO users (username) 
		VALUES ('demo"  . $progressiveId . "')";
	$result2 = pg_query($sql) or die('Error message: ' . pg_last_error());
	
		 
		$_SESSION['login_user']= "demo". $progressiveId ."." . $progressiveId;
		
		// username to display (i'ts equals to usernames for our users; is different for vre users)
		$_SESSION['username_to_display']= "demo".$progressiveId."." . $progressiveId;
		
		// id of user
		$_SESSION['id_user']=$progressiveId;
		
		// variable if is vre user
		$_SESSION['VRE_user']= 0;
		
		// IS THE DEMO
		$_SESSION['Demon_on']= true;
		
		
		
		
		//get 3 demo narratives
		$stories = ["../json/bruni.json", "../json/giantsquid.json", "../json/apuanalps.json"];

		for($i=0; $i<sizeOf($stories); $i++){
			
			$pathToJson = file_get_contents($stories[$i]);


			$json = json_decode($pathToJson, true);

			// record in Narrative table
			$sql= "WITH ins AS (INSERT INTO narrations (id_dbname, title, \"user\", subject) VALUES ('".$_SESSION['login_user']. "-".$json["A1"]["subj"]."', '".$json["A1"]["name"]."', '".$_SESSION['id_user']."', '".$json["A1"]["subj"]."') RETURNING id_dbname) select count(*) from ins";
			$result = pg_query($sql) or die('Error message: ' . pg_last_error());
				
				
			pg_free_result($result);
				
			$sql= "SELECT last_value FROM id_narration_seq";
			$result = pg_query($sql) or die('Error message: ' . pg_last_error());
			while ($row = pg_fetch_row($result)) {
				$idNarra=$row[0];
			}
			pg_free_result($result);

			$currentdbname= $idNarra. $_SESSION['login_user'] . "-".$json["A1"]["subj"];	
			
			//table of all data
			$sql='CREATE TABLE IF NOT EXISTS "'.$currentdbname.'"(
			"id" character(500) primary key,
			"value" jsonb
			);
			';
			$result = pg_query($sql) or die('Error message: ' . pg_last_error());
			pg_free_result($result);	
			
			
			// populate table with json data
			foreach($json as $key => $val) {
			
				$id= $json[$key]["_id"];
				$encodedValue= json_encode(($json[$key]));
				

				$sql2= "INSERT INTO \"".$currentdbname."\" (id, value) 
					VALUES ('" . $id . "', '". pg_escape_string($encodedValue) . "')";
					$result2 = pg_query($sql2) or die('Error message: ' . pg_last_error());	 

			}
			
			//update new id and user to the new narration
			$userWithId= $_SESSION['login_user'];

			$sql= "UPDATE \"" . $currentdbname . "\" SET value= jsonb_set(value, '{id}', '\"$idNarra\"') WHERE id = 'A1'";
			$result = pg_query($sql) or die('Error message: ' . pg_last_error());

			$sql= "UPDATE \"" . $currentdbname . "\" SET value= jsonb_set(value, '{idNarra}', '\"$idNarra\"') WHERE id = 'A1'";
			$result = pg_query($sql) or die('Error message: ' . pg_last_error());

			$sql= "UPDATE \"" . $currentdbname . "\" SET value= jsonb_set(value, '{author}', '\"$userWithId\"') WHERE id = 'A1'";
			$result = pg_query($sql) or die('Error message: ' . pg_last_error()); 
			



		}


	
}



// get all narrations of this user
$arr=[];
$query = "select id, title, subject, copied_from from narrations where \"user\"= '".$_SESSION['id_user']."' order by id desc";
$result = pg_query($query) or die('Error message: ' . pg_last_error());
				
while ($row = pg_fetch_row($result)) {
		array_push($arr,$row);
	}
pg_free_result($result);




		// array json
		$arrayJson= array( "jsonData" => $arr, "usernameToDisplayInMenu"=> $_SESSION['username_to_display'], "username"=>$_SESSION['login_user'] );		
		$data= json_encode($arrayJson);
		echo $data;
















/* 	$query = "select * from users where username= 'demo'";
	$result = pg_query($query) or die('Error message: ' . pg_last_error());
	while ($row = pg_fetch_row($result)) {
		$idUser=$row[0];
		$username= $row[1];
	}
	$numrows = pg_num_rows($result);
	
	$arr=[];
	if ($numrows == 1) {
		
		// username for table name
		//$_SESSION['login_user']=$usernameAdm;   
		$_SESSION['login_user']= $username . "." . $idUser;
		
		// username to display (i'ts equals to usernames for our users; is different for vre users)
		$_SESSION['username_to_display']= $username . "." . $idUser;
		
		// id of user
		$_SESSION['id_user']=$idUser;
		
		// variable if is vre user
		$_SESSION['VRE_user']= 0;
		
		// IS THE DEMO
		$_SESSION['Demon_on']= true;
		
		// get all narrations of this user
		$query = "select id, title, subject, copied_from from narrations where \"user\"= '".$_SESSION['id_user']."' order by id desc";
		$result = pg_query($query) or die('Error message: ' . pg_last_error());
				
		while ($row = pg_fetch_row($result)) {
			array_push($arr,$row);
		}
		pg_free_result($result);
		

	} else {
	$error = "Username or Password is invalid";
			
	}

	





		// array json
		$arrayJson= array( "jsonData" => $arr, "usernameToDisplayInMenu"=> $_SESSION['username_to_display'], "username"=>$_SESSION['login_user'] );		
		$data= json_encode($arrayJson);
		echo $data; */
?>
