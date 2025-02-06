<?php

$slides= $_POST['slides'];
$user= $_POST['user'];

$id_nar= $_POST['idNarr']; 


if (!file_exists('../TempJson')) {
    mkdir('../TempJson', 0777, true);
	chmod('../TempJson', 0777);
}


$fp = fopen('../TempJson/'.$user. '-N' . $id_nar. '-slide.json', 'w');
fwrite($fp, $slides);
fclose($fp);
chmod('../TempJson/'.$user. '-N' . $id_nar. '-slide.json', 0777);


// array json
$arrayJson= array( "url" => 'TempJson/'.$user. '-N' . $id_nar. '-slide.json');		
$data= json_encode($arrayJson);
echo $data;

?>

