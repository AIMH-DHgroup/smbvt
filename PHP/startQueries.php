<?php

require('api_helpers.php');
require('PgConn.php');

$tableName = post_param('dbusername', '');
$payload = fetch_narrative_payload_raw($tableName);

json_response($payload);
