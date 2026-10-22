<?php

require('api_helpers.php');
require('PgConn.php');

$tableName = get_param('dbusername', '');
$payload = fetch_narrative_payload_raw($tableName);

json_response(array('info' => $payload['info']));
