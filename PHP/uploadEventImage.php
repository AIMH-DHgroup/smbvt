<?php
require('PgConn.php');



    if ( 0 < $_FILES['file']['error'] ) {
        echo 'Error: ' . $_FILES['file']['error'] . '<br>';
    }
    else {
        move_uploaded_file($_FILES['file']['tmp_name'], "/var/www/tool.dlnarratives.eu/images/".$_POST['imgName']);
		chmod("/var/www/tool.dlnarratives.eu/images/".$_POST['imgName'], 0777);
    }

?>