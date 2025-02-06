
  
  
var url = new URL(window.location);
var user = url.searchParams.get("user");
var id = url.searchParams.get("id");
var startFromEvent= url.searchParams.get("event");
var map= L.map($(".storymap-map")[0], {zoomControl: false, scrollWheelZoom: false}).setView([44, -120], 4);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var layers = {
		layerOSM:{
			layer:  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
			legend: '<i style="background: #CB2B3E; opacity: 1"></i><p><b>Current event</b></p> <i style="background: #FFD326; opacity: 1"></i><p><b>Historical event</b></p> <i style="background: #2AAD27; opacity: 1"></i><p><b>Natural event</b></p> <i style="background: #CB8427; opacity: 1"></i><p><b>Valorisation event</b></p> <i style="background: #2A81CB; opacity: 1"></i><p><b>Descriptive event</b></p>'
		},
		layerArcGis: {
			layer: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}')
		}

	}


 // get json data (slides of events) based on user and id narrative
$.ajax({
    dataType: "json",
    url: "../storymaps/"+user+"/"+id+"/slide.json",
    mimeType: "application/json",
    success: function(result){
		
		
		// order object by events position
		var sort_by_position = function( a , b){
			a = result.events[a].position;
			b = result.events[b].position;
			if(a > b) return 1;
			if(a < b) return -1;
			return 0;
		}
		var events = Object.keys(result.events).sort(sort_by_position)
		
		
		var eventCoordinatesPoligon= []
		var eventsCoordinatesPoints= [];
		var scenes= {}
		
		var numberScene=2
		
		
		scenes["scene1"] = {"lat" : 46.78203732560553, "lng": 12.82666424871100, "zoom": 5, "name": 'Intro', layers: []}
		
		console.log(result)
		if(result.hasOwnProperty("A1")){
			console.log(result.A1.name)
			$("#titleSlide").append(result.A1.name)
		}
		
		// loop all story events ordered by position
		result.events = events.map(
			function (i) {
				var event = result.events[i]; 
			
			//Media of event
			if(result.events[i].hasOwnProperty('eventMedia') && result.events[i].eventMedia != ""){
				var divImageStory= '<span class="imgContent"><a href="'+result.events[i].eventMedia+'" target="_blank"><img class="sectionImage" src="'+result.events[i].eventMedia+'"></a></span>'
			} else if(result.events[i].hasOwnProperty('media') && result.events[i].media.url != "") {
				var divImageStory= '<span class="imgContent"><a href="'+result.events[i].media.url+'" target="_blank"><img class="sectionImage" src="'+result.events[i].media.url+'"></a></span>'
			}
			
			else {
				var divImageStory= "";
			}
			
			// attach element (title, img, description...) to slide
			$(".storymap-story").append(""+
				'<section data-number-scene="'+numberScene+'" data-scene="scene'+numberScene+'" data-ev-id="'+result.events[i]._id+'" class="sectionSlide" id="scene'+numberScene+'">' +
				'<h2 class="sectionTitle">'+ result.events[i].text.headline +'</h2>' +
				divImageStory +
				'<p class="sectionDescription">' + result.events[i].text.text + '</p>' +
				'</section>'
			
			)
			
			// colors
			if( result.events[i].type ==  "historical event"){
				var markerType= "markerY.png"
				var markerColor= "colorYellow"
			} else if(result.events[i].type ==  "valorisation event" || result.events[i].type == "value chain"){
				var markerType= "markerO.png"
				var markerColor= "colorOrange"
			} else if(result.events[i].type ==  "natural event" || result.events[i].type == "nature"){
				var markerType= "markerG.png"
				var markerColor= "colorGreen"
			} else if(result.events[i].type ==  "descriptive event"){
				var markerType= "markerB.png"
				var markerColor= "colorBlue"
			} else {
				var markerType= "markerGr.png"
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
			
			
			// LAYER MISTO
			
			
/* 			if(result.events[i].hasOwnProperty('polygon') && result.events[i].polygon != ""){
				var coordinate_array = [];
				var poligono1_wkt = [];
				
				for(var idEnt of Object.keys(result.events[i].props)){
					var PolygonSingleEntity= result.items[idEnt].coordinatesPolygon
					console.log(result.items[idEnt])
					if(PolygonSingleEntity != ""){
						poligono1_wkt.push(PolygonSingleEntity)
					}
				}	

				console.log(poligono1_wkt)
				
				
				if (poligono1_wkt.length != 0){
					for (var polygon of poligono1_wkt) {
					  var a = polygon.replace(/, /g, ",");
					  var matches = a.matchAll(/\((.*?)\)/g);

					  var coordinate = [];
					  for (var match of matches) {
						coordinate.push(match[1]);
					  }

					  for (var item of coordinate) {
						var coordinate_coppia = item.split(',');
						var coordinate_coppia2 = coordinate_coppia.map(c => c.replace("(", ""));
						coordinate_array.push(coordinate_coppia2);
					  }
					}

					var finalString = "MULTIPOLYGON (";
					for (var lo = 0; lo < coordinate_array.length; lo++) {
					  finalString += "(";
					  finalString += coordinate_array[lo].join(", ");
					  finalString += ")";
					  if (lo !== coordinate_array.length - 1) {
						finalString += ", ";
					  }
					}
					finalString += ")";
					
					result.events[i].polygon = finalString;
					
					//console.log(finalString)
				}
			} */
			
			
			var allGeometry= [];
			var allPoint= []
			var allPolygon=[];
			var allMultipolygon=[];
			
			var entityNameForEventGeometry= "Local Administrative Units (LAU)";

				// GET GEOMETRY OF ALL SINGLE ENTITIES
				for(var idEnt of Object.keys(result.events[i].props)){
					
					var entityNameForEventGeometryFound= false
	
					var PolygonSingleEntity= result.items[idEnt].coordinatesPolygon
					var PointSingleEntity= result.items[idEnt].coordinatesPoint
					
					var polygonsEntities = [];
					var pointsEntities = [];
					console.log("si")
					// polygon/multipolygons of single entities
					if(PolygonSingleEntity != ""){
						
						if(PolygonSingleEntity == result.events[i].polygon && !entityNameForEventGeometryFound){
							entityNameForEventGeometryFound = true
							entityNameForEventGeometry = result.items[idEnt].enName
						}
						
						//polygon
						if(result.events[i].polygon.startsWith("POLYGON")){
							
							var singlePolygon= []
							var regExp = /\(([^)]+)\)/;
							var extractedPoligonCoordinates = regExp.exec(PolygonSingleEntity)							

							var st= extractedPoligonCoordinates[1].replaceAll("(", "").replaceAll(")", "").replaceAll(", ", ",");
							var extractedPoligonCoordinates2= st.split(",")
							
							
							for (var k=0; k< extractedPoligonCoordinates2.length; k++){
								singlePointsofPoligon= extractedPoligonCoordinates2[k].split(" ");
								singlePolygon.push(singlePointsofPoligon)
							}

							var polygon = {
								"type": "Feature",
								"properties": {"name": result.items[idEnt].enName},
								"geometry": {
									"type": "Polygon",
									"coordinates": [singlePolygon]
								}
							};
							
							
							var polygonStyle = {
									"color": "#ff7800",
									"weight": 5,
									"opacity": 0.65
							}		
							
							allGeometry.push(polygon);
							allPolygon.push(polygon)

							
						
						
						//multipoligon
						} else {
							
							var regExp = /\(([^)]+)\)/g;
							var matches = PolygonSingleEntity.match(regExp);
							
							var multipolyg = [];
							
							for (var k = 0; k < matches.length; k++) {
								var match = matches[k].replace(/[()]/g, '');
								
								var st= match.replaceAll(", ", ",");
								var coords = st.split(',');
								var arr = [];
								
								for (var j = 0; j < coords.length; j++) {
									var coord = coords[j].split(' ');
									arr.push([parseFloat(coord[0]), parseFloat(coord[1])]);
								}
								
								multipolyg.push(arr);
							}
								
							// create json of poligon with coordinates extracted
							var polygon = {
									"type": "Feature",
									"properties": {"name": result.items[idEnt].enName},
									"geometry": {
										"type": "MultiPolygon",
										"coordinates": [multipolyg]
								}
							}; 

							var polygonStyle = {
									"color": "#ff7800",
									"weight": 5,
									"opacity": 0.65
							}

							allGeometry.push(polygon);
							allMultipolygon.push(polygon)
							
							
						
						}
						
					
					// points of single entities
					} else if(PointSingleEntity != ""){
						
						var singlecoord= PointSingleEntity.match(/\(([^)]+)\)/)[1].split(" ")
						
						
						
						var point = {
							"type": "Feature",
							"properties": {
								"popupcontent": "Coors Field",
								"amenity": "Baseball Stadium",
								"name": result.items[idEnt].enName
							},
							"geometry": {
								"type": "Point",
								"coordinates": singlecoord
							}
						};
	
						allGeometry.push(point);
						allPoint.push(point)
						
					}
				
				
				}	
				
				


			

			
			
			
			
			
			// GET GEOMETRY CONNECTED TO THE EVENT
			if(result.events[i].hasOwnProperty('polygon') && result.events[i].polygon != ""){
				
				if(result.events[i].polygon.startsWith("POLYGON")){
					
					// get singles coordinates from format Polygon(lat, lng) 
					var singlePolygon= []
					var regExp = /\(([^)]+)\)/;
					var extractedPoligonCoordinates = regExp.exec(result.events[i].polygon)
					//var extractedPoligonCoordinates2= extractedPoligonCoordinates[1].substring(1).split(", ")
					
					var st= extractedPoligonCoordinates[1].replaceAll("(", "").replaceAll(")", "").replaceAll(", ", ",");
					var extractedPoligonCoordinates2= st.split(",")
					
					
					for (var k=0; k< extractedPoligonCoordinates2.length; k++){
						singlePointsofPoligon= extractedPoligonCoordinates2[k].split(" ");
						singlePolygon.push(singlePointsofPoligon)
					}
					
					// 
					var polygon = {
						"type": "Feature",
						"properties": {"name": entityNameForEventGeometry},
						"geometry": {
							"type": "Polygon",
							"coordinates": [singlePolygon]
						}
					};
					
					
					var polygonStyle = {
							"color": "#ff7800",
							"weight": 5,
							"opacity": 0.65
					}	
					 
					allGeometry.push(polygon);
					allPolygon.push(polygon)
					
					
					// create a layer for the poligon of this event
					var layerobject= {layer:""}
					layers["layerPoligonEv"+numberScene]=layerobject
					layers["layerPoligonEv"+numberScene].layer = L.geoJSON(allGeometry, {
  onEachFeature: function (feature, layer) {
    layer.bindPopup('<p>'+feature.properties.name+'</p>');
  },
  style: polygonStyle
})


					
					console.log("gggggg")
					var boundsPolygon= layers["layerPoligonEv"+numberScene].layer.getBounds()
					console.log(layers["layerPoligonEv"+numberScene])
					console.log(allGeometry)
					var autozoomOnPolygon = map.getBoundsZoom(boundsPolygon);
					
					console.log("fffff")
					scenes["scene"+numberScene] = {"lat" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lat, "lng" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lng, "zoom" : autozoomOnPolygon-1, "name" : result.events[i].text.headline, layers : [layers.layerOSM, layers["layerPoligonEv"+numberScene]]}
					
				} else {

					var regExp = /\(([^)]+)\)/g;
					var matches = result.events[i].polygon.match(regExp);
					
					var multipolyg = [];
					
					for (var k = 0; k < matches.length; k++) {
						var match = matches[k].replace(/[()]/g, '');
						
						var st= match.replaceAll(", ", ",");
						var coords = st.split(',');
						var arr = [];
						
						for (var j = 0; j < coords.length; j++) {
							var coord = coords[j].split(' ');
							arr.push([parseFloat(coord[0]), parseFloat(coord[1])]);
						}
						
						multipolyg.push(arr);
					}
						
					// create json of poligon with coordinates extracted
 					var polygon = {
							"type": "Feature",
							"properties": {"name": entityNameForEventGeometry},
							"geometry": {
								"type": "MultiPolygon",
								"coordinates": [multipolyg]
						}
					}; 
					

					var polygonStyle = {
							"color": "#ff7800",
							"weight": 5,
							"opacity": 0.65
					}	

					allGeometry.push(polygon);
					allMultipolygon.push(polygon)

					var layerobject= {layer:""}
					layers["layerPoligonEv"+numberScene]=layerobject
					layers["layerPoligonEv"+numberScene].layer = L.geoJSON(allGeometry, {
  onEachFeature: function (feature, layer) {
    layer.bindPopup('<p>'+feature.properties.name+'</p>');
  }, 
  style: polygonStyle
})
					
					
					var boundsPolygon= layers["layerPoligonEv"+numberScene].layer.getBounds()
					var autozoomOnPolygon = map.getBoundsZoom(boundsPolygon);
					
					
					scenes["scene"+numberScene] = {"lat" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lat, "lng" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lng, "zoom" : autozoomOnPolygon-1, "name" : result.events[i].text.headline, layers : [layers.layerOSM, layers["layerPoligonEv"+numberScene]]}
				
				
				}				
	
				
			// if there is a point
			} else {
				
				
				var point = {
					"type": "Feature",
					"properties": {
						"popupcontent": "Coors Field",
						"amenity": "Baseball Stadium",
						"name": entityNameForEventGeometry
					},
					"geometry": {
						"type": "Point",
						"coordinates": [result.events[i].longitud.replace(",", "."), result.events[i].latitud.replace(",", ".")]
					}
				};
				
					var polygonStyle = {
							"color": "#ff7800",
							"weight": 5,
							"opacity": 0.65
					}	
	
				//allGeometry.push(point);
				//allPoint.push(point)
				
				
				var layerobject= {layer:""}
				layers["layerPoligonEv"+numberScene]=layerobject
				layers["layerPoligonEv"+numberScene].layer = L.geoJSON(allGeometry, {
  onEachFeature: function (feature, layer) {
    layer.bindPopup('<p>'+feature.properties.name+'</p>');
  },
  style: polygonStyle
})
					
					
				var boundsPolygon= layers["layerPoligonEv"+numberScene].layer.getBounds()
				var autozoomOnPolygon = map.getBoundsZoom(boundsPolygon);
				
					
				scenes["scene"+numberScene] = {"lat" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lat, "lng" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lng, "zoom" : autozoomOnPolygon-1, "name" : result.events[i].text.headline, layers : [layers.layerOSM, layers["layerPoligonEv"+numberScene]]}
				
			
			}
			
			
			numberScene ++
			
		console.log(allGeometry)

		console.log("ooooo")
		})
		

		//layers.layerEventsPolygons.layer= L.layerGroup(eventCoordinatesPoligon)
		
		console.log(layers)
		console.log(scenes)

		

		
		

		$('#storymap').storymap({
			scenes: scenes,
			layers: layers,
			baselayer: layers.layerOSM,
			legend: true,
			mapinteraction: true,
			loader: true,
			flyto: true,
			credits: "<b><a href='https://github.com/EmanueleLenzi92/SMBVT'>SMBVT</a></b>, based on <a href='https://github.com/jakobzhao/storymap'>Storymap.js</a> | <a href='https://leafletjs.com/'>Leaflet</a> | © <a href='https://www.openstreetmap.org/#map=12/55.5725/-2.5339'>OpenStreetMap</a> and contributors",
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
		  $(".leaflet-marker-pane .scene1").attr("src","markerR.png")

		

		// Callback per l'osservatore delle mutazioni
		const observerCallback = function(mutationsList) {
		  for (let mutation of mutationsList) {
			if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
			 
	
				const currentVisibleSectionId = $(".storymap-story .sectionSlide.visible").attr("id");

			 
				if (previousVisibleSectionId !== currentVisibleSectionId) {
						  console.log("La sezione visibile è cambiata da " + previousVisibleSectionId + " a " + currentVisibleSectionId);
						  previousVisibleSectionId = currentVisibleSectionId;
						  
						  $(".leaflet-marker-pane ." + currentVisibleSectionId).attr("src","markerR.png")
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
			console.log(result)
			javascript:window.scrollBy(0, $("section[data-ev-id='"+startFromEvent+"']").offset().top  - $(window).scrollTop() - 10)
			var actualSection= $("section[data-ev-id='" + startFromEvent +"']");
			console.log(actualSection)
			actualScene= parseInt(actualSection.attr("data-number-scene"));
			
			//console.log(actualScene)
			
		}
		
		$("#storymap").css("visibility", "visible")

	
	}
  
  
	}); 



















