<?php

require('api_helpers.php');
ensure_session_started();
destroy_demo_session_if_needed();

require('PgConn.php');

$error = '';
$narratives = array();
$usernameToDisplayInMenu = '';

$username = get_param('username', '');
$password = get_param('passwor', '');

if ($username === '' || $password === '') {
	$error = 'Username or Password is invalid';
} else {
	$username = pg_escape_string(stripslashes($username));
	$password = md5(pg_escape_string(stripslashes($password)));

	$query = "select * from users where password= '" . $password . "' AND username= '" . $username . "'";
	$result = pg_query_or_fail($query);
	$idUser = null;
	while ($row = pg_fetch_row($result)) {
		$idUser = $row[0];
	}
	$numrows = pg_num_rows($result);
	pg_free_result($result);

	if ($numrows === 1 && $idUser !== null) {
		$usernameForSession = normalize_login_user($username) . '.' . $idUser;
		$_SESSION['login_user'] = $usernameForSession;
		$_SESSION['username_to_display'] = $usernameForSession;
		$_SESSION['id_user'] = $idUser;
		$_SESSION['VRE_user'] = 0;

		$usernameToDisplayInMenu = $usernameForSession;
		$narratives = fetch_narrations_for_user($idUser);
	} else {
		$error = 'Username or Password is invalid';
	}

	pg_close($dbconn);
}

json_response(array(
	'jsonData' => $narratives,
	'error' => $error,
	'usernameToDisplayInMenu' => $usernameToDisplayInMenu,
));
