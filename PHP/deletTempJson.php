<?php

$nameJson= $_POST['tempJsonToDelete'];

$file = '../TempJson/' . $nameJson;
$msg="";

if (file_exists($file)) {
    if (unlink($file)) {
        $msg= "Il file $file è stato eliminato con successo.";
    } else {
        $msg= "Si è verificato un errore durante l'eliminazione del file $file.";
    }
} else {
    $msg= "Il file $file non esiste.";
}


// array json
$arrayJson= array( "msg" =>  $msg);		
$data= json_encode($arrayJson);
echo $data;

?>