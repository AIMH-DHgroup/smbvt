
<?php
//DB POSTGRES
require('PgConn.php');


$slides= $_POST['slides'];
$user= $_POST['user'];
//$title= $_POST['narrationTitle'];
$id_nar= $_POST['idNarr']; 
$subjectNarration= $_POST['subject'];

$title= $_POST['idNarr'] . "-" . $_POST['subject'];

if (!file_exists('../storymaps/'.$user)) {
    mkdir('../storymaps/'.$user, 0777, true);
	chmod('../storymaps/'.$user, 0777);
}



if (!file_exists('../storymaps/'.$user. '/N' . $id_nar)) {
    mkdir('../storymaps/'.$user. '/N' . $id_nar, 0777, true);
	chmod('../storymaps/'.$user. '/N' . $id_nar, 0777);
}



$fp = fopen('../storymaps/'.$user. '/N' . $id_nar. '/slide.json', 'w');
fwrite($fp, $slides);
fclose($fp);
chmod('../storymaps/'.$user. '/N' . $id_nar. '/slide.json', 0777);

$html= '<html>
<head>
	<meta charset="UTF-8">
    <title>Storymap - '.$title.'</title>
    <link rel="stylesheet" type="text/css" href="../../../lib/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../../../lib/narra.css" />
    <script src="../../../lib/jquery-3.2.1.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="../../../lib/jquery-ui.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="../../../lib/bootstrap.min.js" type="text/javascript" charset="utf-8"></script>
	<script src="../../lib/demo-narraMaps.js" type="text/javascript" charset="utf-8"></script> 
    <script src="../../../lib/typeahead.bundle.min.js" type="text/javascript" charset="utf-8"></script>

	<link rel="stylesheet" href="https://cdn.knightlab.com/libs/storymapjs/0.8.6/css/storymap.css">
	<script type="text/javascript" src="../../../lib/storymap.js"></script>  
	
	<style>
	#mapdiv{
		width: 100%;
		height: 100%;
	}
	
	body{
		padding: 0 !important;
		background-color: white !important;
		font-family: Verdana, sans-serif;
		font-size: 140% !important;
		text-align: left !important;
	}
	</style>
</head>

<body>

	<div id="mapdiv"></div>

	<!-- <script src="../../lib/LoadJsonSlidesAndBugFixSlide.js" type="text/javascript" charset="utf-8"></script>-->
	<script src="../../lib/LoadJsonSlidesNOBugFixSlide.js" type="text/javascript" charset="utf-8"></script> 
	
</body>
</html>
';

$fp1 = fopen('../storymaps/'.$user. '/N' . $id_nar. '/index.html', 'w');
fwrite($fp1, $html);
fclose($fp1);
chmod('../storymaps/'.$user. '/N' . $id_nar. '/index.html', 0777);




		
		
// array json
		$arrayJson= array( "msg" => $slides, "link" => 'https://dlnarratives.moving.d4science.org/storymaps/'.$user. '/N' . $id_nar. '/');		
		$data= json_encode($arrayJson);
		echo $data;
?>
