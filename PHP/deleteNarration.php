<?php

require('api_helpers.php');
ensure_session_started();
require('PgConn.php');

$context = resolve_narrative_context_from_request(array(
	'method' => 'POST',
	'id_keys' => array('id', 'idNarra', 'dbIdNarra'),
	'subject_keys' => array('subject', 'subjectId'),
));
$dbIdNarra = $context['idNarration'];
$tableName = $context['tableName'];
$message = 'deleted narration: ' . $tableName;

$result = pg_query_or_fail("DROP TABLE IF EXISTS \"$tableName\"");
pg_free_result($result);

$result = pg_query_or_fail('DELETE FROM narrations WHERE id = ' . (int) $dbIdNarra);
pg_free_result($result);

json_response(array('msg' => $message));
