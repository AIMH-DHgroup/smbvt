<?php

require('api_helpers.php');
ensure_session_started();
require('PgConn.php');

if (get_param('dbusername') !== null) {
	$context = resolve_narrative_context_from_request(array(
		'method' => 'GET',
		'id_keys' => array('idNarra'),
		'subject_keys' => array('subjectId', 'subject'),
	));
	$idNarra = $context['idNarration'];
	$firstTitle = get_param('firstTitle', '');
	$tableName = $context['tableName'];

	$result = pg_query_or_fail("SELECT value::jsonb->>'name' as titlejs FROM \"$tableName\" where id = 'A1'");
	$title = '';
	while ($row = pg_fetch_assoc($result)) {
		$title = $row['titlejs'];
	}
	pg_free_result($result);

	if ($title === '') {
		$escapedFirstTitle = pg_escape_string($firstTitle);
		$updateA1 = "UPDATE \"$tableName\" SET value= jsonb_set(value, '{name}', '\"$escapedFirstTitle\"') where id='A1'";
		$result = pg_query_or_fail($updateA1);
		pg_free_result($result);

		$updateNarration = "UPDATE narrations SET title='" . $escapedFirstTitle . "' where id= " . (int) $idNarra;
		$result = pg_query_or_fail($updateNarration);
		pg_free_result($result);
	} else {
		$updateNarration = "UPDATE narrations SET title='" . pg_escape_string($title) . "' where id= " . (int) $idNarra;
		$result = pg_query_or_fail($updateNarration);
		pg_free_result($result);
	}

	json_response(array('title' => $title));
}

if (post_param('dbusername') !== null) {
	$context = resolve_narrative_context_from_request(array(
		'method' => 'POST',
		'id_keys' => array('idNarra'),
		'subject_keys' => array('subjectId', 'subject'),
	));
	$idNarra = $context['idNarration'];
	$newTitle = post_param('newtitle', '');
	$tableName = $context['tableName'];
	$encodedTitle = json_encode(pg_escape_string($newTitle));
	$plainTitle = pg_escape_string($newTitle);

	$result = pg_query_or_fail("UPDATE \"$tableName\" SET value= jsonb_set(value, '{name}', '$encodedTitle') WHERE id = 'A1'");
	pg_free_result($result);

	$result = pg_query_or_fail("UPDATE narrations SET title='$plainTitle' where id= " . (int) $idNarra);
	pg_free_result($result);

	json_response(array('msg' => 'ok'));
}
