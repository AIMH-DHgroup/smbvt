<?php

require('api_helpers.php');
ensure_session_started();
require('PgConn.php');

$userCheck = '';
$allDbName = array();
$idNarra = post_param('idNarra');

if (login_user_value() !== '') {
	$dbName = post_param('dbN', '');
	$parts = explode('-', $dbName, 2);
	$subjectNarration = isset($parts[1]) ? $parts[1] : '';

	$userCheck = login_user_value();
	$result = pg_query_or_fail("SELECT username FROM users where username= '" . pg_escape_string($userCheck) . "'");
	pg_free_result($result);

	if ($idNarra === null || $idNarra === '' || $idNarra === 'null') {
		$sql = "WITH ins AS (INSERT INTO narrations (id_dbname, title, \"user\", subject) VALUES ('" . pg_escape_string($dbName) . "', '" . pg_escape_string($subjectNarration) . "', '" . pg_escape_string((string) current_user_id()) . "', '" . pg_escape_string($subjectNarration) . "') RETURNING id_dbname) select count(*) from ins";
		$result = pg_query_or_fail($sql);
		pg_free_result($result);

		$result = pg_query_or_fail('SELECT last_value FROM id_narration_seq');
		while ($row = pg_fetch_row($result)) {
			$idNarra = $row[0];
		}
		pg_free_result($result);
	}

	$allDbName = fetch_narrations_basic_for_user(current_user_id());
}

json_response(array(
	'username' => $userCheck,
	'allDBName' => $allDbName,
	'idNarra' => $idNarra,
));
