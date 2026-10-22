<?php

require('api_helpers.php');
ensure_session_started();
require('PgConn.php');
require_login_user();

$slides = post_param('slides', '');
$context = resolve_narrative_context_from_request(array(
	'method' => 'POST',
	'id_keys' => array('idNarr', 'idNarra', 'id'),
	'subject_keys' => array('subject', 'subjectId'),
));
$user = $context['storageUser'];
$idNarration = $context['idNarration'];

$tempDir = ensure_directory(app_root_path() . DIRECTORY_SEPARATOR . 'TempJson');
$fileName = $user . '-N' . $idNarration . '-slide.json';
$filePath = $tempDir . DIRECTORY_SEPARATOR . $fileName;

file_put_contents($filePath, $slides);
chmod($filePath, 0777);

json_response(array('url' => 'TempJson/' . $fileName));
