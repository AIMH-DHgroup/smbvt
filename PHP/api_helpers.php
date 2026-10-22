<?php

function ensure_session_started() {
	if (session_status() === PHP_SESSION_NONE) {
		session_start();
	}
}

function app_root_path() {
	return realpath(__DIR__ . '/..');
}

function json_response($data) {
	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($data);
	exit;
}

function json_error_response($message, $statusCode = 400, $extra = array()) {
	http_response_code($statusCode);
	json_response(array_merge(array(
		'ok' => false,
		'message' => $message,
	), $extra));
}

function post_param($key, $default = null) {
	return array_key_exists($key, $_POST) ? $_POST[$key] : $default;
}

function get_param($key, $default = null) {
	return array_key_exists($key, $_GET) ? $_GET[$key] : $default;
}

function session_value($key, $default = null) {
	return array_key_exists($key, $_SESSION) ? $_SESSION[$key] : $default;
}

function destroy_demo_session_if_needed() {
	if (isset($_SESSION['Demon_on'])) {
		session_destroy();
		$_SESSION = array();
		if (session_status() === PHP_SESSION_NONE) {
			session_start();
		}
	}
}

function login_user_value() {
	return session_value('login_user', '');
}

function display_user_value() {
	return session_value('username_to_display', '');
}

function current_user_id() {
	return session_value('id_user');
}

function normalize_login_user($loginUser) {
	return str_replace('-', '', (string) $loginUser);
}

function narrative_table_name($idNarration, $dbUser, $dbName) {
	return (string) $idNarration . (string) $dbUser . '-' . (string) $dbName;
}

function pg_query_or_fail($sql) {
	$result = pg_query($sql);
	if ($result === false) {
		json_error_response('Database error', 500, array('details' => pg_last_error()));
	}
	return $result;
}

function require_login_user() {
	$username = login_user_value();
	if ($username === '') {
		json_error_response('Authentication required', 401);
	}
	return $username;
}

function split_compound_dbusername($dbusername) {
	$result = array(
		'idNarration' => '',
		'storageUser' => '',
		'subjectId' => '',
	);

	if ($dbusername === null || $dbusername === '') {
		return $result;
	}

	if (preg_match('/^(\d+)(.+)-([^\-]+)$/', (string) $dbusername, $matches)) {
		$result['idNarration'] = $matches[1];
		$result['storageUser'] = $matches[2];
		$result['subjectId'] = strtolower($matches[3]);
	}

	return $result;
}

function narration_row_by_id($idNarration) {
	if ($idNarration === null || $idNarration === '' || $idNarration === 'null') {
		return null;
	}

	$result = pg_query_or_fail('SELECT id, subject, copied_from, "user" FROM narrations WHERE id = ' . (int) $idNarration);
	$row = pg_fetch_assoc($result);
	pg_free_result($result);

	return $row ?: null;
}

function assert_narration_access($idNarration) {
	$row = narration_row_by_id($idNarration);
	if ($row === null) {
		json_error_response('Narration not found', 404);
	}

	$currentUserId = (string) current_user_id();
	if ($currentUserId === '' || $currentUserId !== (string) $row['user']) {
		json_error_response('Forbidden', 403);
	}

	return $row;
}

function ensure_narrative_table($tableName) {
	$sql = 'CREATE TABLE IF NOT EXISTS "' . $tableName . '"(' .
		'"id" character(500) primary key,' .
		'"value" jsonb' .
	');';
	$result = pg_query_or_fail($sql);
	pg_free_result($result);
}

function fetch_narrations_for_user($userId) {
	$rows = array();
	if ($userId === null || $userId === '') {
		return $rows;
	}

	$query = "select id, title, subject, copied_from from narrations where \"user\"= '" . pg_escape_string((string) $userId) . "' order by id desc";
	$result = pg_query_or_fail($query);
	while ($row = pg_fetch_row($result)) {
		$rows[] = $row;
	}
	pg_free_result($result);

	return $rows;
}

function fetch_narrations_basic_for_user($userId) {
	$rows = array();
	if ($userId === null || $userId === '') {
		return $rows;
	}

	$query = "select id, title, subject from narrations where \"user\"= '" . pg_escape_string((string) $userId) . "'";
	$result = pg_query_or_fail($query);
	while ($row = pg_fetch_row($result)) {
		$rows[] = $row;
	}
	pg_free_result($result);

	return $rows;
}

function json_storage_dir($subdir = '') {
	$path = app_root_path() . DIRECTORY_SEPARATOR . 'json';
	if ($subdir !== '') {
		$path .= DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $subdir);
	}
	if (!file_exists($path)) {
		mkdir($path, 0777, true);
	}
	return $path;
}

function owl_storage_dir($subdir = '') {
	$path = app_root_path() . DIRECTORY_SEPARATOR . 'owl';
	if ($subdir !== '') {
		$path .= DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $subdir);
	}
	if (!file_exists($path)) {
		mkdir($path, 0777, true);
	}
	return $path;
}

function images_storage_dir() {
	$path = app_root_path() . DIRECTORY_SEPARATOR . 'images';
	if (!file_exists($path)) {
		mkdir($path, 0777, true);
	}
	return $path;
}

function ensure_directory($path) {
	if (!file_exists($path)) {
		mkdir($path, 0777, true);
	}
	return $path;
}

function fetch_narrative_events_map($tableName) {
	$events = array();
	$result = pg_query_or_fail("SELECT id, value FROM \"$tableName\" where id ~ '^ev'");
	while ($row = pg_fetch_assoc($result)) {
		$events[str_replace(' ', '', $row['id'])] = json_decode($row['value']);
	}
	pg_free_result($result);
	return $events;
}

function fetch_narrative_entities_map($tableName) {
	$entities = array();
	$result = pg_query_or_fail("SELECT id, value FROM \"$tableName\" where id ~ '^Q' or id ~ '^U'");
	while ($row = pg_fetch_assoc($result)) {
		$entities[str_replace(' ', '', $row['id'])] = json_decode($row['value']);
	}
	pg_free_result($result);
	return $entities;
}

function fetch_narrative_info_object($tableName) {
	$info = '';
	$result = pg_query_or_fail("SELECT value FROM \"$tableName\" where id = 'A1'");
	while ($row = pg_fetch_assoc($result)) {
		$info = json_decode($row['value']);
	}
	pg_free_result($result);
	return $info;
}

function fetch_narrative_info_json($tableName) {
	$info = '';
	$result = pg_query_or_fail("SELECT value FROM \"$tableName\" where id = 'A1'");
	while ($row = pg_fetch_assoc($result)) {
		$info = $row['value'];
	}
	pg_free_result($result);
	return $info;
}

function resolve_storage_user_for_narration($idNarration, $defaultUser) {
	if ($idNarration === null || $idNarration === '' || $idNarration === 'null') {
		return $defaultUser;
	}

	$row = narration_row_by_id($idNarration);

	if ($row && $row['copied_from'] !== null && $row['copied_from'] !== '') {
		return $row['copied_from'];
	}

	return $defaultUser;
}

function resolve_narrative_context_from_request($options = array()) {
	$method = isset($options['method']) ? strtoupper($options['method']) : 'POST';
	$source = $method === 'GET' ? $_GET : $_POST;
	$idKeys = isset($options['id_keys']) ? $options['id_keys'] : array('idNarra', 'dbIdNarra', 'id');
	$subjectKeys = isset($options['subject_keys']) ? $options['subject_keys'] : array('subjectId', 'subject');
	$allowCreate = !empty($options['allow_create']);
	$compoundKey = isset($options['compound_key']) ? $options['compound_key'] : 'dbusername';

	$username = require_login_user();
	$context = array(
		'loginUser' => $username,
		'displayUser' => display_user_value(),
		'currentUserId' => current_user_id(),
		'idNarration' => '',
		'subjectId' => '',
		'storageUser' => '',
		'tableName' => '',
		'dbName' => '',
	);

	foreach ($idKeys as $key) {
		if (array_key_exists($key, $source) && $source[$key] !== '' && $source[$key] !== null) {
			$context['idNarration'] = preg_replace('/^N/i', '', (string) $source[$key]);
			break;
		}
	}

	foreach ($subjectKeys as $key) {
		if (array_key_exists($key, $source) && $source[$key] !== '' && $source[$key] !== null) {
			$context['subjectId'] = strtolower((string) $source[$key]);
			break;
		}
	}

	$compound = array_key_exists($compoundKey, $source) ? $source[$compoundKey] : '';
	if ($compound !== '') {
		$compoundParts = split_compound_dbusername($compound);
		if ($context['idNarration'] === '' && $compoundParts['idNarration'] !== '') {
			$context['idNarration'] = $compoundParts['idNarration'];
		}
		if ($context['subjectId'] === '' && $compoundParts['subjectId'] !== '') {
			$context['subjectId'] = $compoundParts['subjectId'];
		}
		if ($compoundParts['storageUser'] !== '') {
			$context['storageUser'] = $compoundParts['storageUser'];
		}
	}

	if ($context['idNarration'] !== '') {
		$row = assert_narration_access($context['idNarration']);
		if ($context['subjectId'] === '') {
			$context['subjectId'] = strtolower((string) $row['subject']);
		}
		if ($context['storageUser'] === '') {
			$context['storageUser'] = ($row['copied_from'] !== null && $row['copied_from'] !== '') ? $row['copied_from'] : $username;
		}
	} else {
		if (!$allowCreate) {
			json_error_response('Narration id is required', 400);
		}
		if ($context['subjectId'] === '') {
			json_error_response('Narration subject is required', 400);
		}
		$context['storageUser'] = $context['storageUser'] !== '' ? $context['storageUser'] : $username;
	}

	if ($context['subjectId'] === '') {
		json_error_response('Narration subject is required', 400);
	}

	$context['dbName'] = $context['subjectId'];
	if ($context['storageUser'] === '') {
		$context['storageUser'] = $username;
	}
	if ($context['idNarration'] !== '') {
		$context['tableName'] = narrative_table_name($context['idNarration'], $context['storageUser'], $context['subjectId']);
	}

	return $context;
}

/** Create a narration for regular endpoints and emit their standard JSON error on failure. */
function create_narration_record($storageUser, $subjectId, $userId) {
	$idNarration = insert_narration_record($storageUser, $subjectId, $userId);
	if ($idNarration === null) {
		json_error_response('Database error', 500, array('details' => pg_last_error()));
	}

	return $idNarration;
}

/**
 * Insert only the central narration row and return its generated logical ID.
 * Keeping this lower-level helper free of HTTP exits lets transactional callers roll back safely.
 */
function insert_narration_record($storageUser, $subjectId, $userId, $title = null) {
	$dbName = $storageUser . '-' . $subjectId;
	$narrationTitle = $title === null || $title === '' ? $subjectId : $title;
	// RETURNING avoids reading a sequence-wide last_value, which is unsafe under concurrent requests.
	$result = pg_query_params(
		'INSERT INTO narrations (id_dbname, title, "user", subject) VALUES ($1, $2, $3, $4) RETURNING id',
		array($dbName, $narrationTitle, $userId, $subjectId)
	);
	if ($result === false) {
		return null;
	}

	$row = pg_fetch_assoc($result);
	pg_free_result($result);

	return $row ? $row['id'] : null;
}

function fetch_narrative_payload_raw($tableName) {
	ensure_narrative_table($tableName);

	$events = array();
	$entitys = array();
	$info = '';
	$relations = '';

	$result = pg_query_or_fail("SELECT value FROM \"$tableName\" where id ~ '^ev'");
	while ($row = pg_fetch_assoc($result)) {
		$events[] = $row['value'];
	}
	pg_free_result($result);

	$result = pg_query_or_fail("SELECT value FROM \"$tableName\" where id ~ '^Q' or id ~ '^U'");
	while ($row = pg_fetch_assoc($result)) {
		$entitys[] = $row['value'];
	}
	pg_free_result($result);

	$result = pg_query_or_fail("SELECT value FROM \"$tableName\" where id = 'A1'");
	while ($row = pg_fetch_assoc($result)) {
		$info = $row['value'];
	}
	pg_free_result($result);

	$result = pg_query_or_fail("SELECT value FROM \"$tableName\" where id = 'D1'");
	while ($row = pg_fetch_assoc($result)) {
		$relations = $row['value'];
	}
	pg_free_result($result);

	return array(
		'events' => $events,
		'entitys' => $entitys,
		'info' => $info,
		'relations' => $relations,
	);
}
