<?php

require('api_helpers.php');
ensure_session_started();
session_destroy();

json_response(array('msg' => 'session closed'));
