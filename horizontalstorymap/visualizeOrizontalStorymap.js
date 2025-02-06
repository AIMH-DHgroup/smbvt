
  
  
var url = new URL(window.location);
var user = url.searchParams.get("user");
var id = url.searchParams.get("id");
var map;

var layers = {
		layerOSM:{
			layer:  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
			legend: '<i style="background: #CB2B3E; opacity: 1"></i><p><b>Current event</b></p> <i style="background: #FFD326; opacity: 1"></i><p><b>Historical event</b></p> <i style="background: #2AAD27; opacity: 1"></i><p><b>Natural event</b></p> <i style="background: #CB8427; opacity: 1"></i><p><b>Valorisation event</b></p> <i style="background: #2A81CB; opacity: 1"></i><p><b>Descriptive event</b></p>'
		},
		layerArcGis: {
			layer: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}')
		},
		layerEventsPoints:{
			layer : {}
		},
		layerEventsPolygons:{
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
		
		var numberScene=1
		
		
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
				'<section data-scene="scene'+numberScene+'" class="sectionSlide" id="scene'+numberScene+'">' +
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
			
			// if there is a polygon
			if(result.events[i].hasOwnProperty('polygon') && result.events[i].polygon != ""){
				
				//if format is POLYGON
				if(result.events[i].polygon.startsWith("POLYGON")){
					
					// get singles coordinates from format Polygon(lat, lng) 
					var singlePolygon= []
					var regExp = /\(([^)]+)\)/;
					var extractedPoligonCoordinates = regExp.exec(result.events[i].polygon)
					var extractedPoligonCoordinates2= extractedPoligonCoordinates[1].substring(1).split(", ")
					for (var k=0; k< extractedPoligonCoordinates2.length; k++){
						singlePointsofPoligon= extractedPoligonCoordinates2[k].split(" ");
						singlePolygon.push(singlePointsofPoligon)
					}
					
					// create json of poligon with coordinates extracted
					var featurePoligon = {
						"type": "Feature",
						"properties": {"party": "Republican"},
						"geometry": {
							"type": "Polygon",
							"coordinates": [singlePolygon]
						}
					}; 
					
					var polygonLeaflet= L.polygon(singlePolygon)
					
					// add the geojson polygon to array. It will passed in the geoJson layer
					eventCoordinatesPoligon.push(featurePoligon)
					
					scenes["scene"+numberScene] = {"lat" : polygonLeaflet.getBounds().getCenter().lng, "lng" : polygonLeaflet.getBounds().getCenter().lat, "zoom" : result.events[i].location.zoom, "name" : result.events[i].text.headline, layers : [layers.layerOSM, layers.layerEventsPolygons]}
					
					//if format is MULTIPOLYGON
				} else {
					
					var regExp = /\(([^)]+)\)/g;
					var matches = result.events[i].polygon.match(regExp);
					
					var multipolyg = [];
					
					for (var k = 0; k < matches.length; k++) {
						var match = matches[k].replace(/[()]/g, '');
						var coords = match.split(', ');
						
						var arr = [];
						
						for (var j = 0; j < coords.length; j++) {
							var coord = coords[j].split(' ');
							arr.push([parseFloat(coord[0]), parseFloat(coord[1])]);
						}
						
						multipolyg.push(arr);
					}
						
					// create json of poligon with coordinates extracted
 					var featurePoligon = {
							"type": "Feature",
							"properties": {"p": "p"},
							"geometry": {
								"type": "MultiPolygon",
								"coordinates": [multipolyg]
						}
					};  
					eventCoordinatesPoligon.push(featurePoligon)
						
					var polygonLeaflet= L.polygon(multipolyg)
						
					scenes["scene"+numberScene] = {"lat" : polygonLeaflet.getBounds().getCenter().lng, "lng" : polygonLeaflet.getBounds().getCenter().lat, "zoom" : result.events[i].location.zoom, "name" : result.events[i].text.headline, layers : [layers.layerOSM, layers.layerEventsPolygons]}
						
											

				}					
	
				
			// if there is a point
			} else {
			
				// create coordinate of the event and save it on array to create the layer of events
				//var marker= L.marker([result.events[i].latitud.replace(",", "."), result.events[i].longitud.replace(",", ".")], {icon: colorIcon}).bindPopup('prova')
				var marker= L.marker([result.events[i].latitud.replace(",", "."), result.events[i].longitud.replace(",", ".")], {icon: colorIcon})
				
				 marker.on('click', function() {
					//$(marker._icon).addClass('selectedMarker');
					var markerClicked = marker._icon.className.split(' ')[1]
/* 					$("html").animate(
						  {
							scrollTop: $("." + markerClicked).offset().top
						  },
						  500 //speed
					) */
				}) 
				eventsCoordinatesPoints.push(marker)
				scenes["scene"+numberScene] = {"lat" : result.events[i].latitud.replace(",", "."), "lng" : result.events[i].longitud.replace(",", "."), "zoom" : result.events[i].location.zoom, "name" : result.events[i].text.headline, layers : [layers.layerOSM, layers.layerEventsPoints]}
				
			}
			
			
			numberScene ++
			
			
		
		})
		
		layers.layerEventsPoints.layer = L.layerGroup(eventsCoordinatesPoints)
		

		var polygonStyle = {
				"color": "#ff7800",
				"fillColor": '#ff7800',
				"weight": 5,
				"opacity": 0.65
		}	
		layers.layerEventsPolygons.layer= L.geoJSON(eventCoordinatesPoligon, {style: polygonStyle})
		//layers.layerEventsPolygons.layer= L.polygon(eventCoordinatesPoligon, {color: 'red'})
		
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
			credits: "Build with <i class='material-icons' style='color: red; font-size: 10px;'>favorite</i> from Bo Zhao",
			scalebar: false,
			scrolldown: false,
			progressline: true,
			navwidget: true,
			createMap: function () {
				map = L.map($(".storymap-map")[0], {zoomControl: false, scrollWheelZoom: false}).setView([44, -120], 7);
				basemap = this.baselayer.layer.addTo(map);

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




	
	}
  
  
	}); 






