<?php

require('api_helpers.php');
ensure_session_started();
destroy_demo_session_if_needed();

require('PgConn.php');

$loginUser = login_user_value();
$usernameToDisplayInMenu = display_user_value();
$normalizedUser = '';

if ($loginUser !== '') {
	$normalizedUser = normalize_login_user($loginUser);
}

$narratives = array();
if ($normalizedUser !== '') {
	$narratives = fetch_narrations_for_user(current_user_id());
}

json_response(array(
	'username' => $normalizedUser,
	'usernameToDisplayInMenu' => $usernameToDisplayInMenu,
	'jsonData' => $narratives,
));
