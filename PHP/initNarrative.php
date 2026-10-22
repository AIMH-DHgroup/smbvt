<?php

require('api_helpers.php');
ensure_session_started();
require('PgConn.php');

$username = login_user_value();
if ($username === '') {
	json_response(array('username' => '', 'usernameToDisplayInMenu' => '', 'idNarra' => '', 'storageUser' => '', 'narratives' => array(), 'events' => array(), 'entitys' => array(), 'info' => '', 'relations' => ''));
}

$subjectId = strtolower(post_param('subjectId', ''));
$idNarra = post_param('idNarra', '');
$displayName = display_user_value();
$storageUser = resolve_storage_user_for_narration($idNarra, $username);

if ($idNarra === null || $idNarra === '' || $idNarra === 'null') {
	$idNarra = create_narration_record($storageUser, $subjectId, current_user_id());
}

$tableName = narrative_table_name($idNarra, $storageUser, $subjectId);
$payload = fetch_narrative_payload_raw($tableName);

json_response(array(
	'username' => $username,
	'usernameToDisplayInMenu' => $displayName,
	'idNarra' => $idNarra,
	'storageUser' => $storageUser,
	'narratives' => fetch_narrations_for_user(current_user_id()),
	'events' => $payload['events'],
	'entitys' => $payload['entitys'],
	'info' => $payload['info'],
	'relations' => $payload['relations'],
));
