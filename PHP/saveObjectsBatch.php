<?php

require('api_helpers.php');
ensure_session_started();
require('PgConn.php');

$context = resolve_narrative_context_from_request(array(
	'method' => 'POST',
));
$tableName = $context['tableName'];
$objectsPayload = post_param('objects', '[]');
$objects = json_decode($objectsPayload, true);

if (!is_array($objects)) {
	json_response(array('msg' => 'invalid objects payload', 'saved' => 0));
}

ensure_narrative_table($tableName);

$begin = pg_query_or_fail('BEGIN');
pg_free_result($begin);

$savedCount = 0;

try {
	foreach ($objects as $object) {
		if (!is_array($object) || !array_key_exists('id', $object) || !array_key_exists('value', $object)) {
			continue;
		}

		$objectId = pg_escape_string((string) $object['id']);
		$objectJson = pg_escape_string(json_encode($object['value']));
		$sql = "INSERT INTO \"$tableName\" (id, value) VALUES ('" . $objectId . "', '" . $objectJson . "') " .
			"ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value";
		$result = pg_query_or_fail($sql);
		pg_free_result($result);
		$savedCount += 1;
	}

	$commit = pg_query_or_fail('COMMIT');
	pg_free_result($commit);
} catch (Exception $e) {
	$rollback = pg_query_or_fail('ROLLBACK');
	pg_free_result($rollback);
	throw $e;
}

json_response(array('msg' => 'objects saved', 'saved' => $savedCount));
