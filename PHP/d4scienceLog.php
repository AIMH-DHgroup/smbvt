<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

//DB POSTGRES
require('PgConn.php');

// lib OpenId
require 'vendor/autoload.php';

// create jumOpenId object
$issuer = 'https://accounts.d4science.org/auth/realms/d4science';
$cid = 'moving-narrative';
$secret = 'de4cb277-f3a8-42ff-ac80-3168e6f19163';
$oidc = new Jumbojett\OpenIDConnectClient($issuer, $cid, $secret);

// authenticate
$oidc->authenticate();

/* 
// get user info example
$userSub= $oidc->requestUserInfo('sub');
$userName= $oidc->requestUserInfo('name');
$userEmail= $oidc->requestUserInfo('email');
 */
$userSub= $oidc->requestUserInfo('sub');
$userEmail= $oidc->requestUserInfo('email');

// get access token decoded and not decoded
$accessTokDEcoded= $oidc->getAccessTokenPayload();
//$accessTokNotDecoded= $oidc->getAccessToken();


// if user is member of moving VRE
/* $movingVRELink= '%2Fd4science.research-infrastructures.eu%2FFARM%2FMOVING_Project';
if($accessTokDEcoded->resource_access->$movingVRELink->roles == 'Member'){ */ 

	session_start();

	// find if vre user exist in user table
	$query= "SELECT count(*) as totaluser FROM users where \"username\" = '" . $userSub ."'";
	$result = pg_query($query) or die('Error message: ' . pg_last_error());
	while ($row = pg_fetch_row($result)) {
		$numberOfUsers =$row[0];
	}
	pg_free_result($result);


	//if exist, get his id and create session
	if ($numberOfUsers == 1) {
		
		$query= "SELECT id FROM users where \"username\" = '" . $userSub ."'";
		$result = pg_query($query) or die('Error message: ' . pg_last_error());
		
		while ($row = pg_fetch_row($result)) {
			$idUser =$row[0];
		}
		pg_free_result($result);
		
		// session for username to create table
		$usernameForTable= str_replace("-","",$userSub);
		$_SESSION['login_user']= $usernameForTable . "." . $idUser;
		
		// session for username to be displeyed in menu and ID
		$_SESSION['username_to_display']= $oidc->requestUserInfo('name');
		$_SESSION['id_user']=$idUser;
		$_SESSION['VRE_user']= 1;


	} else {
		
		// if not exist, get their vre links
		$vreLinksJson= $accessTokDEcoded->resource_access;
		$vreLinksString = "";
		foreach($vreLinksJson as $key => $val) {
			
			$vreLinksString .= $key . ", ";

		}
		 
		//and insert the user in db, get last value of id in user_seq, and create session
		$query= "INSERT INTO users (username, email, vrelinks) VALUES ('" . $userSub . "', '" . $userEmail . "', '" . pg_escape_string($vreLinksString) . "');";
		$result = pg_query($query) or die('Error message: ' . pg_last_error());
		pg_free_result($result);

		$sql= "SELECT last_value FROM id_users_seq";
		$result = pg_query($sql) or die('Error message: ' . pg_last_error());
		while ($row = pg_fetch_row($result)) {
			$idUser= $row[0];
		}
		pg_free_result($result);
		
		
		// session for username to create table
		$usernameForTable= str_replace("-","",$userSub);
		$_SESSION['login_user']= $usernameForTable . "." . $idUser;
		
		// session for username to be displeyed in menu and ID
		$_SESSION['username_to_display']= $oidc->requestUserInfo('name');
		$_SESSION['id_user']=$idUser;
		$_SESSION['VRE_user']= 1;

	}


	// go to homepage with session created
	header("Location: ../index.html");

/* } else {
	
	header("Location: https://moving.d4science.org/group/moving_storymaps");

} */




//echo $oidc->requestUserInfo('name');
//print_r($clientCredentialsToken);


?>