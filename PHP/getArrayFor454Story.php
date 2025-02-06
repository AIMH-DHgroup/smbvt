<?php
$jsonContent = file_get_contents("/var/www/tool.dlnarratives.eu/Moving400Stories/stories2Storymap/slide.json");
$jsonData = json_decode($jsonContent, true);

$resultArray = array();
foreach ($jsonData as $item) {
	$id = $item['Id'];
	$country = $item['Country'];
	$latitude = $item['Latitude'];
	$longitude = $item['Longitude'];
	$link= $item['Link3'];

    $resultArray[$id] = array(
        'Country' => $country,
        'Latitude' => $latitude,
        'Longitude' => $longitude,
		'link' => $link
    );
	
}

echo  var_export($resultArray, true);


?>