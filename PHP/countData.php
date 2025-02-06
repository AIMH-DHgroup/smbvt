 <?php
 // Imposta gli header per consentire l'accesso cross-origin
header("Access-Control-Allow-Origin: *"); // Consenti l'accesso da qualsiasi origine
header("Access-Control-Allow-Methods: GET"); // Specifica i metodi consentiti (in questo caso solo GET)
header("Access-Control-Allow-Headers: Content-Type"); // Specifica gli header consentiti
 
 //DB POSTGRES CONN
 require('PgConn.php');

 $query= "SELECT count(*) FROM \"public\".\"users\"";
$result = pg_query($query) or die('Error message: ' . pg_last_error());
			
while ($row = pg_fetch_row($result)) {
	$numberAut= $row[0];
}
pg_free_result($result); 

/* $rootDirectory = '/var/www/tool.dlnarratives.eu/storymaps';
$folderCount = countSubfolders($rootDirectory); */

$query= "select count(*) from information_schema.tables where table_schema = 'public';";
$result = pg_query($query) or die('Error message: ' . pg_last_error());
			
while ($row = pg_fetch_row($result)) {
	$folderCount= $row[0];
}
pg_free_result($result); 


// array json
$arrayJson= array( "numberAut" => $numberAut, "numerPublishedNarratives" => $folderCount);	
$data= json_encode($arrayJson);
echo $data; 



//count foulders of narratives
function countSubfolders($directory) {
    $excludeFolders = array('adminNarra', 'lib', 'MOVING', 'moving.52.old', 'MOVING4', 'osm', 'osm2', 'osm3', 'osm4', 'osm4', 'prova2', 'prova_auto' );
    $count = 0;

    if (is_dir($directory)) {
        $folders = scandir($directory);

        foreach ($folders as $folder) {
            if ($folder != '.' && $folder != '..' && is_dir($directory . '/' . $folder)) {
				
                if (!in_array($folder, $excludeFolders)) {
                    $subfolders = glob($directory . '/' . $folder . '/*', GLOB_ONLYDIR);
					$count += count($subfolders) + 1;
                }
            }
        }
    }

    return $count;
}
?>