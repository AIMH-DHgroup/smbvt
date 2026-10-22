<?php

require('api_helpers.php');
ensure_session_started();
require('PgConn.php');
require_login_user();

$context = resolve_narrative_context_from_request(array(
	'method' => 'GET',
	'id_keys' => array('id'),
	'subject_keys' => array('subject', 'subjectId'),
));

$user = $context['storageUser'];
$id = preg_replace('/^N/i', '', (string) get_param('id', ''));
$link = owl_storage_dir('narratives') . DIRECTORY_SEPARATOR . $user . '_N' . $id . '.owl';

json_response(array('fileExists' => file_exists($link) ? 1 : 0));
