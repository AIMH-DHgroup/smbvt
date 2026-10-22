<?php

require('api_helpers.php');
ensure_session_started();
require('PgConn.php');

$context = resolve_narrative_context_from_request(array(
	'method' => 'POST',
));
$objectId = post_param('objId', '');
$message = 'Nessuna eliminazione';
$tableName = $context['tableName'];

$result = pg_query_or_fail("SELECT id FROM \"$tableName\" WHERE id = '" . pg_escape_string($objectId) . "'");
$rows = pg_num_rows($result);

if ($rows === 1) {
	$result2 = pg_query_or_fail("DELETE FROM \"$tableName\" WHERE id = '" . pg_escape_string($objectId) . "'");

	if (substr($objectId, 0, 1) === 'Q' || substr($objectId, 0, 1) === 'U') {
		$message = 'entità ' . $objectId . ' eliminata';
	} elseif (substr($objectId, 0, 2) === 'ev') {
		$message = 'evento ' . $objectId . ' eliminato';
	} elseif ($objectId === 'D1') {
		$message = 'relazione D1 ' . $objectId . ' eliminata';
	} elseif ($objectId === 'A1') {
		$message = 'info A1 ' . $objectId . ' eliminata';
	}

	pg_free_result($result2);
}

pg_free_result($result);

json_response(array('msg' => $message));
