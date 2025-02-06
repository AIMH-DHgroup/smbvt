<?php

if(isset($_POST['events'])){
	var_dump($_POST['events']);
}

if(isset($_GET['dbusername_'])){
	
require('PgConn.php');


	$events=[];
	$entitys=[];
	$info="";
	$relations="";
	$currentdbname= $_GET['dbusername_'];

	//get events
	$sql= "SELECT value FROM \"".$currentdbname."\" where id ~ '^ev'";
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());


	while ($row=pg_fetch_assoc($result)) {
		array_push($events, $row['value']);
	}
	pg_free_result($result);
	
	
	//get entitys
	$sql= "SELECT value FROM \"".$currentdbname."\" where id ~ '^Q' or id ~ '^U'" ;
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());
	
	while ($row=pg_fetch_assoc($result)) {
		array_push($entitys, $row['value']);
	}
	pg_free_result($result);
	
	
	//get info (A1)
	$sql= "SELECT value FROM \"".$currentdbname."\" where id = 'A1'" ;
	$result = pg_query($sql) or die('Error message: ' . pg_last_error());
	
	while ($row=pg_fetch_assoc($result)) {
		$info= $row['value'];
	}
	pg_free_result($result);



		// array json
		$data= array( "events" => $events, "entitys" => $entitys, "info"=> $info);	
		$arrayJson= json_encode($data);
		echo $arrayJson;
		exit;
		
}
		

?>

<!DOCTYPE html>
<html lang="en">
<head>
 <title>Story Map</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!--add required stylesheets-->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <!--leaflet css-->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.4.0/leaflet.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css">
	
	<link href="../../lib/narra.css" rel="stylesheet">
	<link href="../../horizontalstorymap/movingStyle.css" rel="stylesheet">

    <!--add favicon for the web page-->
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">

    <!--Font-->
    <link href="https://fonts.googleapis.com/css?family=Cairo" rel="stylesheet">

    <link rel="stylesheet" type="text/css" href="../../horizontalstorymap/storymap.2.5.css">

    <!--add required libraries-->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.4.0/leaflet.js"></script>
    <!--jquery and Popper-->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js"></script>

    <!--boostrap-->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
    <!--leaflet.ajax for asynchronously adding geojson data-->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet-ajax/2.1.0/leaflet.ajax.min.js"></script>

    <!--mini globle map-->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/topojson/1.6.19/topojson.min.js"></script>
    <script src="../../horizontalstorymap/globeminimap.js"></script>
	
	<!--WKT to GeoJson-->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/wicket/1.3.8/wicket.min.js"></script>

	<script>
	var actualScene=1
	</script>
    <!--story map plugin-->
    <script src="../../horizontalstorymap/storymap.2.5.js"></script>
	
	

	
	<style>
	.sectionTitle{margin-bottom:8%;text-align:center; color: #1c1c1c}
	.sectionImage{max-width:90%; margin-bottom:8%}
	
	.imgContent{text-align:center; width:100%; display: block;}
	
	
	.storymap-legend{background: rgba(255, 255, 255, 1);}
	.viewing{opacity:1}
	

	
	
	.storymap-legend{width:12vw !important}
	
	.zoomIn {
	width: 8%;
    margin-left: auto;
    margin-right: auto;
	}

	.zindexTop{z-index: 1000 !important}


.dropbtn {
  background-color: rgb(240, 240, 240);

  padding: 16px;
  font-size: 16px;
  border: none;
  width: 100%;
}

.otherVisual {
  position: absolute;
  display: inline-block;
  right: 0px;
  top: 0px;
  font-size: 1.5em;
  border: 1px solid black;
  min-width:15%
}

.otherNarratives{
  position: absolute;
  display: inline-block;
  left: 0px;
  top: 0px;
  width:15%;
  border: 1px solid black
}

.otherVisual-content {
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 20;
}

.otherVisual-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.otherVisual-content a:hover {background-color: #ddd;}

.otherVisual:hover .otherVisual-content {display: block;}

.otherVisual:hover .dropbtn {background-color: #ddd;}	
	

	</style>
	
</head>
<body>

<div id="storymap" class="container-fluid" style="visibility:hidden">
    <div class="row">
        <div class="col-sm-6 col-md-8 storymap-map"></div>
        <div class="col-sm-6 col-md-4 storymap-story">
			
			<?php if($_GET["user"] == "moving.52") {$backgroundImg= "../images/MOVING/sfondo.png";} else {$backgroundImg="../images/storymapBackground.png";}?>
            <section data-scene="scene1" id="scene1" data-background="<?php echo $backgroundImg; ?>" class="sectionSlide">
			
                <div class="fullscreen text-center">
					
					
 					<a href="https://dlnarratives.moving.d4science.org/Moving_454_Storymaps/"><div class="otherVisual">
					  <button class="dropbtn">Overall map</button>
<!-- 					  <div class="otherVisual-content">

					  </div> -->
					</div> </a>
					
					<?php 
						$user = $_GET["user"];
						$idNarra = $_GET["id"];
						$nameDataset = "moving";
						
						if(isset($user) && isset($idNarra)){
						
							echo'<a href="../../../Search/?user='.$user.'&id='.$idNarra.'&dataset='.$nameDataset.'">
									<div class="otherNarratives">
									<button class="dropbtn">Search</button>

										</div>
									</a>';

						
						} else {
							echo'<div class="otherNarratives"><button class="dropbtn" onclick="history.back()">Back</button></div>';
						}
					?>
					
					
					<?php if($_GET["user"] == "moving.52") { echo '<img src="../images/MOVING/logo.png"  style="width: 20%; position: absolute; left: 0; right: 0; margin: auto;">' ;} ?>
					
                   

					<h1 class="display-4 d-flex justify-content-center" id="titleSlide" style="white-space: normal !important; color: rgba(60,60,60,0.95) !important; text-shadow: 0 0 BLACK"></h1>
                    <small class="d-flex justify-content-center" style="color: rgba(60,60,60,0.95); font-size:100% !important" id="subTitleSlide">Image credits: MOVING and Wikimedia Commons
                    </small>
					<small class="d-flex justify-content-center" style="color: rgba(60,60,60,0.95); font-size:100% !important">Created with &nbsp;<b>SMBVT</b>&nbsp; and an &nbsp;<b>Automatic Workflow</b></small>
                </div>
            </section>		
		
		</div>
    </div>
</div>

<div id="arrowUp" class="zoomIn material-icons d-flex fixed-top mt-1 storymap-scroll-top justify-content-center" style="display:none !important">keyboard_arrow_up</div>
<div class="zoomIn material-icons d-flex fixed-bottom mb-1 storymap-scroll-down justify-content-center">keyboard_arrow_down</div>

<!-- <div class="d-flex fixed-bottom justify-content-left"><div class="zoomIn material-icons storymap-scroll-down">keyboard_arrow_down</div></div> -->


<script>

var url = new URL(window.location);
var user = url.searchParams.get("user");
var id = url.searchParams.get("id");
var startFromEvent= url.searchParams.get("start");
var map= L.map($(".storymap-map")[0], {zoomControl: false, scrollWheelZoom: false}).setView([44, -120], 4);
L.tileLayer('http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var layers = {
		layerOSM:{
			//http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
			layer: L.tileLayer('http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}'),
			legend: '<i style="background: #CB2B3E; opacity: 1"></i><p><b>Current event</b></p> <i style="background: #FFD326; opacity: 1"></i><p><b>Historical event</b></p> <i style="background: #2AAD27; opacity: 1"></i><p><b>Natural event</b></p> <i style="background: #CB8427; opacity: 1"></i><p><b>Valorisation event</b></p> <i style="background: #2A81CB; opacity: 1"></i><p><b>Descriptive event</b></p>'
		},
		layerArcGis: {
			layer:  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
		},
		layerEventsPoints:{
			layer : {}
		}
	}


 // get json data (slides of events) based on user and id narrative

	$.ajax({
		type: "GET",

		dataType: "JSON",					
		data: {dbusername_: "<?php echo $_GET["preview"]; ?>"},
		success: function(resp) {
			

			
		
		
		//parse json of events/entities
		var events = resp.events.map(JSON.parse);
		var info= JSON.parse(resp.info)
		var entitysArray = resp.entitys.map(str => JSON.parse(str));
		//create key id for obj entities
		var entitys = entitysArray.reduce((acc, obj) => {
			acc[obj._id] = obj;
			return acc;
		}, {});
		console.log(events)
		console.log(info)
		console.log(entitys)
		
		
		// order object by events position
		var sort_by_position = function( a , b){
			a = events[a].position;
			b = events[b].position;
			if(a > b) return 1;
			if(a < b) return -1;
			return 0;
		}
		var Nevents = Object.keys(events).sort(sort_by_position)
		
		
		var eventCoordinatesPoligon= [];
		var eventsCoordinatesPoints= [];
		var scenes= {};
		
		var numberScene=2;
		
		
		scenes["scene1"] = {"lat" : 46.78203732560553, "lng": 12.82666424871100, "zoom": 5, "name": 'Intro', layers: []}
		
		
		//if(resp.hasOwnProperty("A1")){
			
			$("#titleSlide").append(info.name)
		//}
		
		// loop all story events ordered by position
		events = Nevents.map(
			function (i) {
				
			//include only events with coordinate points or polygon
			if((events[i].hasOwnProperty('latitud') && events[i].latitud != "") || (events[i].hasOwnProperty('polygon') &&  events[i].polygon != "")){
				
				
				var event = events[i]; 
				console.log(i)
			
			//Media of event
			if(events[i].hasOwnProperty('eventMedia') && events[i].eventMedia != ""){
				var divImageStory= '<span class="imgContent"><a href="'+events[i].eventMedia+'" target="_blank"><img class="sectionImage" src="'+events[i].eventMedia+'"></a></span>'
			} else if(events[i].hasOwnProperty('media') && events[i].media.url != "") {
				var divImageStory= '<span class="imgContent"><a href="'+events[i].media.url+'" target="_blank"><img class="sectionImage" src="'+events[i].media.url+'"></a></span>'
			}
			
			else {
				var divImageStory= "";
			}
			
			// attach element (title, img, description...) to slide
			if(events[i].hasOwnProperty('text') && events[i].hasOwnProperty('headline')){
				var title= events[i].hasOwnProperty('headline');
				var description= events[i].text.text;

			} else {
				var description= events[i].description;
				var title= events[i].title;
				events[i].text = { headline : title, text :description }
				console.log("ooop")
				console.log(description)	
			}
			$(".storymap-story").append(""+
				'<section data-number-scene="'+numberScene+'" data-scene="scene'+numberScene+'" data-ev-id="'+events[i]._id+'" class="sectionSlide" id="scene'+numberScene+'">' +
				'<h2 class="sectionTitle">'+ title +'</h2>' +
				divImageStory +
				'<p class="sectionDescription">' + description + '</p>' +
				'</section>'
			
			)
			
			// colors
			if( events[i].type ==  "historical event"){
				var markerType= "../horizontalstorymap/markerY.png"
				var markerColor= "colorYellow"
			} else if(events[i].type ==  "valorisation event" || events[i].type == "value chain"){
				var markerType= "../horizontalstorymap/markerO.png"
				var markerColor= "colorOrange"
			} else if(events[i].type ==  "natural event" || events[i].type == "nature"){
				var markerType= "../horizontalstorymap/markerG.png"
				var markerColor= "colorGreen"
			} else if(events[i].type ==  "descriptive event"){
				var markerType= "../horizontalstorymap/markerB.png"
				var markerColor= "colorBlue"
			} else {
				var markerType= "../horizontalstorymap/markerGr.png"
				var markerColor= "colorGrey"
			}
			
			
			
			
			var colorIcon = new L.Icon({
			  iconUrl: markerType,
			  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
			  className:  "scene"+numberScene + " " + markerColor,
			  iconSize: [25, 41],
			  iconAnchor: [12, 41],
			  popupAnchor: [1, -34],
			  shadowSize: [41, 41]
			});
			
			

			//find entity name of all geographical entities (polygon/point) of the event
			var allGeometry= [];
			var entityNameForEventGeometry= "Local Administrative Units (LAU)";
			var idEntChosen= "";
			
			for(var idEnt of Object.keys(events[i].props)){
				
				// consider only if the entity has coordinates (poligon, multipolygon, point)
				if(entitys[idEnt].hasOwnProperty('coordinatesPoint') || entitys[idEnt].hasOwnProperty('coordinatesPolygon')){
			
					var entityNameForEventGeometryFound= false;
				
					var PolygonSingleEntity= entitys[idEnt].coordinatesPolygon
					if(PolygonSingleEntity===undefined){PolygonSingleEntity=""}
					var PointSingleEntity= entitys[idEnt].coordinatesPoint
					if(PointSingleEntity===undefined){PointSingleEntity=""}
					console.log(PointSingleEntity)
					console.log(PolygonSingleEntity)
					if(PolygonSingleEntity != ""){
						
						if(PolygonSingleEntity == events[i].polygon && !entityNameForEventGeometryFound){
							entityNameForEventGeometryFound = true
							entityNameForEventGeometry = entitys[idEnt].enName
							idEntChosen= idEnt
						}
						
						var wicket = new Wkt.Wkt();
						var readGeometry = wicket.read(PolygonSingleEntity);
                        console.log("", readGeometry);
						var geometry= readGeometry.toJson()
						
						var polygon = {
							"type": "Feature",
							"properties": {
								"popupcontent": "",
								"id": idEnt,
								"name": entitys[idEnt].enName
							},
							geometry
						};
						
						allGeometry.push(polygon);
					
					} else if(PointSingleEntity != ""){
					
					
						console.log(PointSingleEntity)
						console.log(events[i].point)
						
						if(PointSingleEntity == "Point("+events[i].longitud + " " + events[i].latitud +")" && !entityNameForEventGeometryFound){
							entityNameForEventGeometryFound = true
							entityNameForEventGeometry = entitys[idEnt].enName
							idEntChosen= idEnt
						}
						
						var wicket = new Wkt.Wkt();
						var readGeometry = wicket.read(PointSingleEntity);
						var geometry= readGeometry.toJson()
						
						var point = {
							"type": "Feature",
							"properties": {
								"popupcontent": "",
								"id": idEnt,
								"name": entitys[idEnt].enName
							},
							geometry
						};						
						
						allGeometry.push(point);
					
					}
				}
			
			}
			
			
			////// if is CONCLUDING REMARK event, display all geometry
			if( events[i].title == "Concluding remarks"){
					
					// all points and polygons if any in allGeometry array
					if( allGeometry.length != 0){
						var polygonStyle = {
								"color": "#ff7800",
								"weight": 5,
								"opacity": 0.65
						}
						
						var layerobject= {layer:""}
						layers["layerPoligonEv"+numberScene]=layerobject
						layers["layerPoligonEv"+numberScene].layer = L.geoJSON(allGeometry, {
						  onEachFeature: function (feature, layer) {
							layer.bindPopup('<a target="_blank" href="https://www.wikidata.org/wiki/'+feature.properties.id+'"><p>'+feature.properties.name+'</p></a>');
						  },
						  style: polygonStyle
						})

						
						var boundsPolygon= layers["layerPoligonEv"+numberScene].layer.getBounds()

						var autozoomOnPolygon = map.getBoundsZoom(boundsPolygon);
						
						scenes["scene"+numberScene] = {"lat" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lat, "lng" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lng, "zoom" : autozoomOnPolygon-1, "name" : events[i].text.headline, layers : [layers.layerOSM, layers["layerPoligonEv"+numberScene]]}
					
					// else the single coordinate of csv (poligon if any or point)
					} else {
						//if there is polygon
						console.log(allGeometry)
						if(events[i].hasOwnProperty('polygon') && events[i].polygon != ""){
							var wicket = new Wkt.Wkt();
							var readGeometry = wicket.read(events[i].polygon);
							var geometry= readGeometry.toJson()
							
							if(events[i].hasOwnProperty('eventPlaceLable') && events[i].eventPlaceLable != ""){entityNameForEventGeometry= events[i].eventPlaceLable}
							var polygon = [{
								"type": "Feature",
								"properties": {"name": entityNameForEventGeometry},
								geometry
							}];
							
							
							var polygonStyle = {
									"color": "#ff7800",
									"weight": 5,
									"opacity": 0.65
							}	
							
							var layerobject= {layer:""}
							layers["layerPoligonEv"+numberScene]=layerobject
							layers["layerPoligonEv"+numberScene].layer = L.geoJSON(polygon, {
								onEachFeature: function (feature, layer) {

									layer.bindPopup("Local Administrative Units (LAU");
								},
								style: polygonStyle
							})
							
							
							var boundsPolygon= layers["layerPoligonEv"+numberScene].layer.getBounds()
							var autozoomOnPolygon = map.getBoundsZoom(boundsPolygon);
							console.log(autozoomOnPolygon)
							
							scenes["scene"+numberScene] = {"lat" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lat, "lng" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lng, "zoom" : autozoomOnPolygon-1, "name" : events[i].text.headline, layers : [layers.layerOSM, layers["layerPoligonEv"+numberScene]]}
						
						
						//if there isn't polygon
						} else {
							console.log(allGeometry)
							if(events[i].hasOwnProperty('eventPlaceLable') && events[i].eventPlaceLable != ""){entityNameForEventGeometry= events[i].eventPlaceLable}
							var marker= L.marker([events[i].latitud.replace(",", "."), events[i].longitud.replace(",", ".")], {icon: colorIcon}).bindPopup(entityNameForEventGeometry)
							
							eventsCoordinatesPoints.push(marker)
							scenes["scene"+numberScene] = {"lat" : events[i].latitud.replace(",", "."), "lng" : events[i].longitud.replace(",", "."), "zoom" : 10, "name" : events[i].text.headline, layers : [layers.layerOSM, layers.layerEventsPoints]}
				
						
						}
					
					}
					
			} else 
			////////////
			
			
			// if there is a polygon
			if(events[i].hasOwnProperty('polygon') && events[i].polygon != ""){
				
					var wicket = new Wkt.Wkt();
					var readGeometry = wicket.read(events[i].polygon);
					var geometry= readGeometry.toJson()
					
					
					if(events[i].hasOwnProperty('eventPlaceLable') && events[i].eventPlaceLable != ""){entityNameForEventGeometry= events[i].eventPlaceLable}
					 
					var polygon = [{
						"type": "Feature",
						"properties": {"name": entityNameForEventGeometry},
						geometry
					}];
					
					
					var polygonStyle = {
							"color": "#ff7800",
							"weight": 5,
							"opacity": 0.65
					}	
					
					// create a layer for the poligon of this event
					var layerobject= {layer:""}
					layers["layerPoligonEv"+numberScene]=layerobject
					layers["layerPoligonEv"+numberScene].layer = L.geoJSON(polygon, {
						onEachFeature: function (feature, layer) {
							if(idEntChosen != ""){
								var entityNameWikiLink= '<a target="_blank" href="https://www.wikidata.org/wiki/'+idEntChosen+'"><p>'+feature.properties.name+'</p></a>'
							} else {
								var entityNameWikiLink= '<p>'+feature.properties.name+'</p>'
							}
							layer.bindPopup(entityNameWikiLink);
						},
						style: polygonStyle
					})
					
					
					var boundsPolygon= layers["layerPoligonEv"+numberScene].layer.getBounds()
					var autozoomOnPolygon = map.getBoundsZoom(boundsPolygon);
					console.log(autozoomOnPolygon)
					
					scenes["scene"+numberScene] = {"lat" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lat, "lng" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lng, "zoom" : autozoomOnPolygon-1, "name" : events[i].text.headline, layers : [layers.layerOSM, layers["layerPoligonEv"+numberScene]]}
				
								
	
				
			// if there is a point
			} else {
			
				// create coordinate of the event and save it on array to create the layer of events
				if(idEntChosen != ""){
					var entityNameWikiLink= "<a target='_blank' href='https://www.wikidata.org/wiki/"+idEntChosen+"'>" + entityNameForEventGeometry + "</a>"
				} else {
					if(events[i].hasOwnProperty('eventPlaceLable') && events[i].eventPlaceLable != ""){entityNameForEventGeometry= events[i].eventPlaceLable}
					var entityNameWikiLink= entityNameForEventGeometry
				}
				
				var marker= L.marker([events[i].latitud.replace(",", "."), events[i].longitud.replace(",", ".")], {icon: colorIcon}).bindPopup(entityNameWikiLink)
				
/*  				 marker.on('click', function() {
					var markerClicked = marker._icon.className.split(' ')[1]
					javascript:window.scrollBy(0, $("section[data-scene='"+markerClicked+"']").offset().top  - $(window).scrollTop() - 10)
					$("html").animate(
						  {
							scrollTop: $("#"+markerClicked).offset().top
						  },
						  0 //speed
					)
					
				}) */  
				eventsCoordinatesPoints.push(marker)
				scenes["scene"+numberScene] = {"lat" : events[i].latitud.replace(",", "."), "lng" : events[i].longitud.replace(",", "."), "zoom" : 10, "name" : events[i].text.headline, layers : [layers.layerOSM, layers.layerEventsPoints]}
				
			}
			
			
			numberScene ++
			
		}
			
		
		})
		
		layers.layerEventsPoints.layer = L.layerGroup(eventsCoordinatesPoints)

		
		//layers.layerEventsPolygons.layer= L.layerGroup(eventCoordinatesPoligon)
		
		console.log(layers)
		console.log(scenes)

		console.log(eventsCoordinatesPoints)
		

		$('#storymap').storymap({
			scenes: scenes,
			layers: layers,
			baselayer: layers.layerOSM,
			legend: true,
			mapinteraction: true,
			loader: true,
			flyto: true,
			credits: "<b><a href='https://github.com/EmanueleLenzi92/SMBVT'>SMBVT</a></b>, based on <a href='https://github.com/jakobzhao/storymap'>Storymap.js</a> | <a href='https://leafletjs.com/'>Leaflet</a> | © <a href='https://www.openstreetmap.org/#map=12/55.5725/-2.5339'>OpenStreetMap</a> and contributors | © Google",
			scalebar: false,
			scrolldown: false,
			progressline: true,
			navwidget: true,
			createMap: function () {
/* 				map = L.map($(".storymap-map")[0], {zoomControl: false, scrollWheelZoom: false}).setView([44, -120], 7);
				basemap = this.baselayer.layer.addTo(map); */

				L.control.zoom({
					position: 'bottomright'
				}).addTo(map);
				

				//add an miniglobe
				new L.Control.GlobeMiniMap({
					marker: 'red',
					position: 'bottomright'
				}).addTo(map);

				return map;
			}
		});
		
		//disable scroll zoom
		map.scrollWheelZoom.disable()

		
		// scrollbar always on top after refresh page
		
			window.onbeforeunload = function () {
			window.scrollTo(0, 0);
			}
		
		
		//add buttons to other visualisations / search page
/* 		$('.otherVisual-content').append(""+
		"<a href='../storymaps/" + user + "/" +id+ "/?visualization=map'>Storymap</a>" +
		"<a href='../storymaps/" + user + "/" +id+ "/?visualization=timeline'>Timeline</a>" +
		//"<a href='#'>Event with related entities</a>"
		""
		) */
		


		const container = document.querySelector('.storymap-story');

		// Opzioni per l'osservatore
		const observerConfig = { childList: true, subtree: true, attributes: true };
		
		// Variabile per memorizzare l'ID della sezione visibile precedente (pin primo evento rosso)
		  let previousVisibleSectionId = $(".storymap-story .sectionSlide.visible").attr("id");
		  $(".leaflet-marker-pane .scene1").attr("src","../horizontalstorymap/markerR.png")

		

		// Callback per l'osservatore delle mutazioni
		const observerCallback = function(mutationsList) {
		  for (let mutation of mutationsList) {
			if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
			 
	
				const currentVisibleSectionId = $(".storymap-story .sectionSlide.visible").attr("id");

			 
				if (previousVisibleSectionId !== currentVisibleSectionId) {
						  console.log("La sezione visibile è cambiata da " + previousVisibleSectionId + " a " + currentVisibleSectionId);
						  previousVisibleSectionId = currentVisibleSectionId;
						  
						  $(".leaflet-marker-pane ." + currentVisibleSectionId).attr("src","../horizontalstorymap/markerR.png")
						  $(".leaflet-marker-pane ." + currentVisibleSectionId).addClass("zindexTop")
						  
/* 						  var classesPreviusMarker= $(".leaflet-marker-pane ." + previousVisibleSectionId).attr("class");
						  console.log(classesPreviusMarker) */
				}
				
				console.log(currentVisibleSectionId)
				if(currentVisibleSectionId == "scene1"){
					$("#arrowUp").attr("style","display: none !important")
				} else {
					$("#arrowUp").css("display","flex")
				}
			  

				  
			}
		  }
		};

		// Crea un osservatore delle mutazioni
		const observer = new MutationObserver(observerCallback);

		// Avvia l'osservatore delle mutazioni
		observer.observe(container, observerConfig);

		
		
		if(startFromEvent != null){
			console.log(resp)
			javascript:window.scrollBy(0, $("section[data-ev-id='"+startFromEvent+"']").offset().top  - $(window).scrollTop() - 10)
			var actualSection= $("section[data-ev-id='" + startFromEvent +"']");
			console.log(actualSection)
			actualScene= parseInt(actualSection.attr("data-number-scene"));
			
			//console.log(actualScene)
			
		}
		
		$("#storymap").css("visibility", "visible")
	}

})	
	
  
  

</script>


</body>
</html>
