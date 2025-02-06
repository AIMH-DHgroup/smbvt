
<?php
require('PgConn.php');

// move the blob file (passed by loadImageFromFile js function) in the images folder
move_uploaded_file(
    $_FILES['file']['tmp_name'], 
    "/var/www/tool.dlnarratives.eu/images/".$_POST['fileName']
); 

chmod("/var/www/tool.dlnarratives.eu/images/".$_POST['fileName'], 0777);

echo json_encode('Model uploaded successfully.');

?>