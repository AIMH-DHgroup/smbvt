
  
  
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
				
			//include only events with coordinate points or polygon
			if((result.events[i].hasOwnProperty('latitud') && result.events[i].latitud != "") || (result.events[i].hasOwnProperty('polygon') &&  result.events[i].polygon != "")){
				
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
				
				

				//find entity name of all geographical entities (polygon/point) of the event
				var allGeometry= [];
				var entityNameForEventGeometry= "Local Administrative Units (LAU)";
				var idEntChosen= "";
				
				for(var idEnt of Object.keys(result.events[i].props)){
					console.log(result.items[idEnt])
					// consider only if the entity has coordinates (poligon, multipolygon, point)
					if(result.items[idEnt].hasOwnProperty('coordinatesPoint') || result.items[idEnt].hasOwnProperty('coordinatesPolygon')){
				
						var entityNameForEventGeometryFound= false;
					
						var PolygonSingleEntity= result.items[idEnt].coordinatesPolygon
						if(PolygonSingleEntity===undefined){PolygonSingleEntity=""}
						var PointSingleEntity= result.items[idEnt].coordinatesPoint
						if(PointSingleEntity===undefined){PointSingleEntity=""}
						console.log(PointSingleEntity)
						console.log(PolygonSingleEntity)
						if(PolygonSingleEntity != ""){
							
							if(PolygonSingleEntity == result.events[i].polygon && !entityNameForEventGeometryFound){
								entityNameForEventGeometryFound = true
								entityNameForEventGeometry = result.items[idEnt].enName
								idEntChosen= idEnt
							}
							
							var wicket = new Wkt.Wkt();
							var readGeometry = wicket.read(PolygonSingleEntity);
							var geometry= readGeometry.toJson()
							
							var polygon = {
								"type": "Feature",
								"properties": {
									"popupcontent": "",
									"id": idEnt,
									"name": result.items[idEnt].enName
								},
								geometry
							};
							
							allGeometry.push(polygon);
						
						} else if(PointSingleEntity != ""){
						
						
							console.log(PointSingleEntity)
							console.log(result.events[i].point)
							
							if(PointSingleEntity == "Point("+result.events[i].longitud + " " + result.events[i].latitud +")" && !entityNameForEventGeometryFound){
								entityNameForEventGeometryFound = true
								entityNameForEventGeometry = result.items[idEnt].enName
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
									"name": result.items[idEnt].enName
								},
								geometry
							};						
							
							allGeometry.push(point);
						
						}
					}
				
				}
				
				
				////// if is CONCLUDING REMARK event, display all geometry
				if( result.events[i].title == "Concluding remarks"){
						
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
							
							scenes["scene"+numberScene] = {"lat" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lat, "lng" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lng, "zoom" : autozoomOnPolygon-1, "name" : result.events[i].text.headline, layers : [layers.layerOSM, layers["layerPoligonEv"+numberScene]]}
						
						// else the single coordinate of csv (poligon if any or point)
						} else {
							//if there is polygon
							console.log(allGeometry)
							if(result.events[i].hasOwnProperty('polygon') && result.events[i].polygon != ""){
								var wicket = new Wkt.Wkt();
								var readGeometry = wicket.read(result.events[i].polygon);
								var geometry= readGeometry.toJson()
								
								if(result.events[i].hasOwnProperty('eventPlaceLable') && result.events[i].eventPlaceLable != ""){entityNameForEventGeometry= result.events[i].eventPlaceLable}
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
								
								scenes["scene"+numberScene] = {"lat" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lat, "lng" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lng, "zoom" : autozoomOnPolygon-1, "name" : result.events[i].text.headline, layers : [layers.layerOSM, layers["layerPoligonEv"+numberScene]]}
							
							
							//if there isn't polygon
							} else {
								console.log(allGeometry)
								if(result.events[i].hasOwnProperty('eventPlaceLable') && result.events[i].eventPlaceLable != ""){entityNameForEventGeometry= result.events[i].eventPlaceLable}
								var marker= L.marker([result.events[i].latitud.replace(",", "."), result.events[i].longitud.replace(",", ".")], {icon: colorIcon}).bindPopup(entityNameForEventGeometry)
								
								eventsCoordinatesPoints.push(marker)
								scenes["scene"+numberScene] = {"lat" : result.events[i].latitud.replace(",", "."), "lng" : result.events[i].longitud.replace(",", "."), "zoom" : result.events[i].location.zoom, "name" : result.events[i].text.headline, layers : [layers.layerOSM, layers.layerEventsPoints]}
					
							
							}
						
						}
						
				} else 
				////////////
				
				
				// if there is a polygon
				if(result.events[i].hasOwnProperty('polygon') && result.events[i].polygon != ""){
					
						var wicket = new Wkt.Wkt();
						var readGeometry = wicket.read(result.events[i].polygon);
						var geometry= readGeometry.toJson()

						
						if(result.events[i].hasOwnProperty('eventPlaceLable') && result.events[i].eventPlaceLable != ""){entityNameForEventGeometry= result.events[i].eventPlaceLable}
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
						
						scenes["scene"+numberScene] = {"lat" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lat, "lng" : layers["layerPoligonEv"+numberScene].layer.getBounds().getCenter().lng, "zoom" : autozoomOnPolygon-1, "name" : result.events[i].text.headline, layers : [layers.layerOSM, layers["layerPoligonEv"+numberScene]]}
					
									
		
					
				// if there is a point
				} else {
				
					// create coordinate of the event and save it on array to create the layer of events
					if(idEntChosen != ""){
						var entityNameWikiLink= "<a target='_blank' href='https://www.wikidata.org/wiki/"+idEntChosen+"'>" + entityNameForEventGeometry + "</a>"
					} else {
						if(result.events[i].hasOwnProperty('eventPlaceLable') && result.events[i].eventPlaceLable != ""){entityNameForEventGeometry= result.events[i].eventPlaceLable}
						var entityNameWikiLink= entityNameForEventGeometry
					}
					
					var marker= L.marker([result.events[i].latitud.replace(",", "."), result.events[i].longitud.replace(",", ".")], {icon: colorIcon}).bindPopup(entityNameWikiLink)
					
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
					scenes["scene"+numberScene] = {"lat" : result.events[i].latitud.replace(",", "."), "lng" : result.events[i].longitud.replace(",", "."), "zoom" : result.events[i].location.zoom, "name" : result.events[i].text.headline, layers : [layers.layerOSM, layers.layerEventsPoints]}
					
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



















