<?php

require('api_helpers.php');
ensure_session_started();
require('PgConn.php');

$message = 'nessuna query di inserimento o modifica al DB';
$context = resolve_narrative_context_from_request(array(
	'method' => 'POST',
));
$objectJson = pg_escape_string(post_param('objclist', ''));
$objectId = post_param('objcid', '');
$tableName = $context['tableName'];

ensure_narrative_table($tableName);

$upsert = "INSERT INTO \"$tableName\" (id, value) VALUES ('" . pg_escape_string($objectId) . "', '" . $objectJson . "') " .
	"ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value";
$result = pg_query_or_fail($upsert);

if (substr($objectId, 0, 1) === 'Q' || substr($objectId, 0, 1) === 'U') {
	$message = 'entità ' . $objectId . ' salvata';
} elseif (substr($objectId, 0, 2) === 'ev') {
	$message = 'evento ' . $objectId . ' salvato';
} elseif ($objectId === 'D1') {
	$message = 'relazione D1 ' . $objectId . ' salvata';
} elseif ($objectId === 'A1') {
	$message = 'info A1 ' . $objectId . ' salvata';
}

pg_free_result($result);

json_response(array('msg' => $message));
