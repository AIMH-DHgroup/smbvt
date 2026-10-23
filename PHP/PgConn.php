<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (isset($_SESSION['Demon_on'])) {
    require '/var/try/PgConnDemo.php';
} else {
    require '/var/try/PgConn.php';
}
