<?php

require('api_helpers.php');
ensure_session_started();
require('PgConn.php');

$context = resolve_narrative_context_from_request(array(
	'method' => 'POST',
	'id_keys' => array('idNarr', 'idNarra', 'id'),
	'subject_keys' => array('subject', 'subjectId'),
));
$slides = post_param('slides', '');
$user = $context['storageUser'];
$title = post_param('narrationTitle', '');
$idNarration = $context['idNarration'];
$subjectNarration = $context['subjectId'];
$baseUrl = post_param('baseURL', '');

$tableName = $context['tableName'];
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$triplifyRoot = realpath(__DIR__ . '/../Triplify');

$events = fetch_narrative_events_map($tableName);
$entities = fetch_narrative_entities_map($tableName);
$info = fetch_narrative_info_object($tableName);

if (isset($_SESSION['Demon_on'])) {
	$datasetFs = 'https://tool.dlnarratives.eu/fuseki/prova2';
	$datasetName = 'prova2';
	$storageSubdir = 'prova2';
} elseif (isset($info->CSVnumber)) {
	$datasetFs = 'https://tool.dlnarratives.eu/fuseki/moving';
	$datasetName = 'moving';
	$storageSubdir = 'moving';
} else {
	$datasetFs = 'https://tool.dlnarratives.eu/fuseki/narratives';
	$datasetName = 'narratives';
	$storageSubdir = 'narratives';
}

$triplifyPayload = array(
	'entities' => $entities,
	'narra' => $info,
	'events' => $events,
);

$jsonDir = json_storage_dir($storageSubdir);
$owlDir = owl_storage_dir($storageSubdir);
$jsonPath = $jsonDir . DIRECTORY_SEPARATOR . $user . '_N' . $idNarration . '.json';
$owlPath = $owlDir . DIRECTORY_SEPARATOR . $user . '_N' . $idNarration . '.owl';

file_put_contents($jsonPath, json_encode($triplifyPayload));
chmod($jsonPath, 0777);

$output = array();
$retval = null;
if ($triplifyRoot !== false) {
	$command = 'java -jar ' . escapeshellarg($triplifyRoot . DIRECTORY_SEPARATOR . 'triplify.jar') . ' ' .
		escapeshellarg($jsonPath) . ' ' .
		escapeshellarg($owlPath) . ' ' .
		escapeshellarg($datasetFs) . ' 2>&1';
	exec($command, $output, $retval);
	if (file_exists($owlPath)) {
		chmod($owlPath, 0777);
	}
} else {
	$output[] = 'Triplify directory not found';
	$retval = 1;
}

$storyBaseDir = ensure_directory(app_root_path() . DIRECTORY_SEPARATOR . 'storymaps' . DIRECTORY_SEPARATOR . $user);
$storyDir = ensure_directory($storyBaseDir . DIRECTORY_SEPARATOR . 'N' . $idNarration);

$slideJsonPath = $storyDir . DIRECTORY_SEPARATOR . 'slide.json';
file_put_contents($slideJsonPath, $slides);
chmod($slideJsonPath, 0777);

$searchLink = '../../../Search/?user=' . $user . '&id=N' . $idNarration . '&dataset=' . $datasetName;
$visualizationLinks = array(
	'<a href="?visualization=map">Storymap</a>',
	'<a href="?visualization=timeline">Timeline</a>',
);
if (!isset($info->CSVnumber)) {
	$visualizationLinks[] = '<a href="../../../Entity_With_Events/?user=' . $user . '&idNarra=N' . $idNarration . '&dataset=' . $datasetName . '">Entity With Related Events</a>';
}

$html = '<html>
<head>
	<meta charset="UTF-8">
    <title>Narrative - ' . $title . '</title>
    <link rel="stylesheet" type="text/css" href="../../../lib/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../../../lib/narra.css" />
    <script src="../../../lib/jquery-3.2.1.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="../../../lib/jquery-ui.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="../../../lib/bootstrap.min.js" type="text/javascript" charset="utf-8"></script>
	
    <script src="../../../lib/typeahead.bundle.min.js" type="text/javascript" charset="utf-8"></script>
	
	<script src="../../lib/visualization.js" type="text/javascript" charset="utf-8"></script>
	<link rel="stylesheet" href="https://cdn.knightlab.com/libs/storymapjs/0.8.6/css/storymap.css">
	<script type="text/javascript" src="../../../lib/storymap.js"></script>
	<link rel="stylesheet" type="text/css" href="../../../lib/timeline.css" />
	<script src="../../../lib/timeline-min.js" type="text/javascript" charset="utf-8"></script>
	<link rel="stylesheet" type="text/css" href="../../lib/narrativeVisualization.css" />
</head>
<body>
	<div id="menu">
		<div id="titleTable">
		<h1>' . $title . '</h1>
		</div>
		<div class="otherVisual">
		  <button class="dropbtn">Other Visualizations</button>
		  <div class="otherVisual-content">
			' . implode("\n\t\t\t", $visualizationLinks) . '
		  </div>
		</div>
		<a href="' . $searchLink . '">
		<div class="otherNarratives">
		  <button class="dropbtn">Search</button>
		</div>
		</a>
	</div>
	<div id="mapdiv"></div>
</body>
</html>';

$indexPath = $storyDir . DIRECTORY_SEPARATOR . 'index.html';
file_put_contents($indexPath, $html);
chmod($indexPath, 0777);

$link = $scheme . '://' . $baseUrl . '/storymaps/' . $user . '/N' . $idNarration . '/';

json_response(array(
	'msg' => $slides,
	'link' => $link,
	'output' => $output,
	'exitCode' => $retval,
));
