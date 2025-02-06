
  
  
var url = new URL(window.location);
var user = url.searchParams.get("user");
var id = url.searchParams.get("id");
var startFromEvent= url.searchParams.get("start");
var preview = url.searchParams.get("preview")
var map= L.map($(".storymap-map")[0], {zoomControl: false, scrollWheelZoom: false}).setView([44, -120], 4);
//L.tileLayer('http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}', {
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var layers = {
		layerOSM:{
			//http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
			layer: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
			legend: '<i style="background: #CB2B3E; opacity: 1"></i><p><b>Current event</b></p> <i style="background: #FFD326; opacity: 1"></i><p><b>Historical event</b></p> <i style="background: #2AAD27; opacity: 1"></i><p><b>Natural event</b></p> <i style="background: #CB8427; opacity: 1"></i><p><b>Valorisation event</b></p> <i style="background: #2A81CB; opacity: 1"></i><p><b>Descriptive event</b></p>'
		},
		layerArcGis: {
			layer:  L.tileLayer('http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}')
		},
		layerEventsPoints:{
			layer : {}
		}
	}


 // get json data (slides of events) based on user and id narrative OR data from DB for previews
/*  if(url.searchParams.get("preview")){
	 var ajaxData= {dbusername_: url.searchParams.get("preview")}
	 var ajaxUrl= "index4.php"
	 } else {
	  var ajaxData= ""
	  var ajaxUrl= "../storymaps/"+user+"/"+id+"/slide.json"
	} */
 

if(preview==1){
	var urlAjax= "../TempJson/"+user+"-"+id+"-slide.json"
} else {
	var urlAjax= "../storymaps/"+user+"/"+id+"/slide.json"
}

$.ajax({
    dataType: "json",
    url: urlAjax,
	//url: ajaxUrl,
	//data: ajaxData,
    mimeType: "application/json",
    success: function(result){
		
		//////////// If is a preview////////////
/* 		if(url.searchParams.get("preview")){
			//parse json of events/entities
			var events = result.events.map(JSON.parse);
			var info= JSON.parse(result.info)
			var entitysArray = result.entitys.map(str => JSON.parse(str));
			//create key id for obj entities
			var entitys = entitysArray.reduce((acc, obj) => {
				acc[obj._id] = obj;
				return acc;
			}, {});	
		
		
		} */
		/////////////////////////////////////////
		
		
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
			
			if(result.A1.hasOwnProperty("coverImg")){
			$("#scene1").attr("data-background", result.A1.coverImg);
			}
			
			
			//if there is a sketchfab model
			if(result.A1.hasOwnProperty("sketchfabIdModels")){
				
				for(var j=0; j<result.A1.sketchfabIdModels.length; j++){
					$(".storymap-map").append('<div class="sketchfab-embed-wrapper" id="sketchfab-embed-wrapper-'+result.A1.sketchfabIdModels[j]+'"> <iframe class="api-frame" id="api-frame'+[j]+'" title="" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/'+result.A1.sketchfabIdModels[j]+'/embed?camera=0"> </iframe> </div>')

					var iframe = document.getElementById( 'api-frame'+j );
					var uid = result.A1.sketchfabIdModels[j];
					var client = new Sketchfab( iframe );
					
					client.init( uid, {
						success: function onSuccess( api ){
							api.start();
							api.addEventListener( 'viewerready', function() {
								
								//hide all annotations at the beginning
								api.getAnnotationList(function(err, annotations) {
									if (!err) {
										window.console.log(annotations);
										for(var ann=0; ann < annotations.length; ann++){

											api.hideAnnotation(ann, function(err, index) {
												if (!err) {
													window.console.log('Hiding annotation', index + 1);
												}
											});		
										
										}
									}
								});								

								console.log( 'Viewer ' + j+ ' is ready' );
									
								// next and previus annotation associated with slide arrows
								$("#arrowDown").on("click", function(){
								
									var currentVisibleSectionId3D = $(".storymap-story .sectionSlide.visible").next(".sectionSlide");
									
									if (currentVisibleSectionId3D.attr('data-coordinate3d') !== undefined) {
										
										api.gotoAnnotation(currentVisibleSectionId3D.attr('data-coordinate3d'),  {preventCameraAnimation: false, preventCameraMove: false}, function(err, index) {
											if (!err) {
												window.console.log('Going to annotation', index + 1);
											}
										});
										
										api.showAnnotationTooltip(currentVisibleSectionId3D.attr('data-coordinate3d'), function(err) {
											if (!err) {
												window.console.log('Showing annotation tooltip');
											}
										});
									}
									
								}) 
								
								$(".storymap-scroll-down1").on("click", function(){

							

								
									var currentVisibleSectionId3D = $(".storymap-story .sectionSlide.visible").next(".sectionSlide");
									
									if (currentVisibleSectionId3D.attr('data-coordinate3d') !== undefined) {
										
										$(".sketchfab-embed-wrapper").css( "display","none" ); //nasconde tutti i modelli 3d
										$("#sketchfab-embed-wrapper-"+currentVisibleSectionId3D.attr('data-sketchfabid')).css( "display","block" ); //visualizza solo quello corrente		

/*  										api.hideAnnotation(Number(currentVisibleSectionId3D.attr('data-coordinate3d'))-1, function(err, index) {
											if (!err) {
												window.console.log('hide annotation', index + 1);
											}
										}); */	 

 										api.getAnnotationList(function(err, annotations) {
											if (!err) {
												window.console.log(annotations);
												for(var ann=0; ann < annotations.length; ann++){
													if(ann != Number(currentVisibleSectionId3D.attr('data-coordinate3d'))){
													api.hideAnnotation(ann, function(err, index) {
														if (!err) {
															window.console.log('Hiding annotation', index + 1);
														}
													});	
													}											
												
												}
											}
										});	 									


										api.showAnnotation(currentVisibleSectionId3D.attr('data-coordinate3d'), function(err, index) {
											if (!err) {
												window.console.log('Show annotation', index + 1);
											}
										});	

																				
										api.gotoAnnotation(currentVisibleSectionId3D.attr('data-coordinate3d'),  {preventCameraAnimation: false, preventCameraMove: false}, function(err, index) {
											if (!err) {
												window.console.log('Going to annotation', index + 1);
												
											
/* 												setTimeout(function (){
												api.getCameraLookAt(function(err, camera) {
													window.console.log(camera.position[1]); // [x, y, z]
													window.console.log(camera.target); // [x, y, z]
																			
 													api.setCameraLookAt([camera.position[0], camera.position[1], camera.position[2]], [camera.target[0]+1, camera.target[1], camera.target[2]], 1, function(err) {
														if (!err) {
															window.console.log('Camera moved');

														}
													});  
												});	
												},1000) */
											
											}

										
										});
										
										api.showAnnotationTooltip(currentVisibleSectionId3D.attr('data-coordinate3d'), function(err) {
											if (!err) {
												window.console.log('Showing annotation tooltip');
											}
										});
										
									
										
									}
									
								})
															
								$("#arrowUp").on("click", function(){
								
									var currentVisibleSectionId3D = $(".storymap-story .sectionSlide.visible").prev(".sectionSlide");
									
									if (currentVisibleSectionId3D.attr('data-coordinate3d') !== undefined) {
										
										
										api.gotoAnnotation(currentVisibleSectionId3D.attr('data-coordinate3d'),  {preventCameraAnimation: false, preventCameraMove: false}, function(err, index) {
											if (!err) {
												window.console.log('Going to annotation', index + 1);
											}
										});
										
										api.showAnnotationTooltip(currentVisibleSectionId3D.attr('data-coordinate3d'), function(err) {
											if (!err) {
												window.console.log('Showing annotation tooltip');
											}
										});	
										
									}
									
								})
								
								$(".storymap-scroll-top1").on("click", function(){
								
									var currentVisibleSectionId3D = $(".storymap-story .sectionSlide.visible").prev(".sectionSlide");
									
									if (currentVisibleSectionId3D.attr('data-coordinate3d') !== undefined) {
										
										$(".sketchfab-embed-wrapper").css( "display","none" ); //nasconde tutti i modelli 3d
										$("#sketchfab-embed-wrapper-"+currentVisibleSectionId3D.attr('data-sketchfabid')).css( "display","block" ); //visualizza solo quello corrente
										
/*  										api.hideAnnotation(Number(currentVisibleSectionId3D.attr('data-coordinate3d'))+1, function(err, index) {
											if (!err) {
												window.console.log('hide annotation', index + 1);
											}
										});	 */ 
										
 										api.getAnnotationList(function(err, annotations) {
											if (!err) {
												window.console.log(annotations);
												for(var ann=0; ann < annotations.length; ann++){
													if(ann != Number(currentVisibleSectionId3D.attr('data-coordinate3d'))){
													api.hideAnnotation(ann, function(err, index) {
														if (!err) {
															window.console.log('Hiding annotation', index + 1);
														}
													});	
													}											
												
												}
											}
										}); 	
					

										api.showAnnotation(currentVisibleSectionId3D.attr('data-coordinate3d'), function(err, index) {
											if (!err) {
												window.console.log('Show annotation', index + 1);
											}
										});	
										

										api.gotoAnnotation(currentVisibleSectionId3D.attr('data-coordinate3d'),  {preventCameraAnimation: false, preventCameraMove: false}, function(err, index) {
											if (!err) {
												window.console.log('Going to annotation', index + 1);
											}
										});
										
										api.showAnnotationTooltip(currentVisibleSectionId3D.attr('data-coordinate3d'), function(err) {
											if (!err) {
												window.console.log('Showing annotation tooltip');
											}
										});	
										
										
									}
									
								})
							
							});	


						

							
							//annotation associated with left menu 
							$(".storymap-navwidget li").on("click", function(){
									var aElement = $(this).find("a");

									var currentVisibleSectionId3DID = aElement.attr("data-goTosceneId");
									var currentVisibleSectionId3D= $("#"+currentVisibleSectionId3DID)
									
									if (currentVisibleSectionId3D.attr('data-coordinate3d') !== undefined) {

										api.getAnnotationList(function(err, annotations) {
											if (!err) {
												window.console.log(annotations);
												for(var ann=0; ann < annotations.length; ann++){
													if(ann != Number(currentVisibleSectionId3D.attr('data-coordinate3d'))){
													api.hideAnnotation(ann, function(err, index) {
														if (!err) {
															window.console.log('Hiding annotation', index + 1);
														}
													});	
													}											
												
												}
											}
										});	
					

										api.showAnnotation(currentVisibleSectionId3D.attr('data-coordinate3d'), function(err, index) {
											if (!err) {
												window.console.log('Show annotation', index + 1);
											}
										});	
										

										api.gotoAnnotation(currentVisibleSectionId3D.attr('data-coordinate3d'),  {preventCameraAnimation: false, preventCameraMove: false}, function(err, index) {
											if (!err) {
												window.console.log('Going to annotation', index + 1);
											}
										});
										
										api.showAnnotationTooltip(currentVisibleSectionId3D.attr('data-coordinate3d'), function(err) {
											if (!err) {
												window.console.log('Showing annotation tooltip');
											}
										});	

									
									}
							})
							
						},
						error: function onError() {
							console.log( 'Viewer error' );
						},
						annotation_tooltip_visible: 1,

						annotations_visible: 1,
						camera :0

					})
					

					
				}
			}
		}
		
		// loop all story events ordered by position
		result.events = events.map(
			function (i) {
				
				//////////////OLD Media of event (mediaEvent=string) eventMedia can be an image or a video
				if(result.events[i].hasOwnProperty('eventMedia') && typeof result.events[i].eventMedia === "string" && result.events[i].eventMedia != ""){
					
					//media caption
					if(result.events[i].hasOwnProperty('eventMediaCaption') && result.events[i].eventMediaCaption != ""){var mediaCaption = result.events[i].eventMediaCaption } else {var mediaCaption= ""}
						
					//event video
					if(result.events[i].eventMedia.includes("www.youtube.com")){
						
						
						var divImageStory= convertYouTubeLinkToIframe(result.events[i].eventMedia)
						divImageStory += "</br><i>" + mediaCaption + "</i>"
						
						
					//event image
					} else {

						//media caption
						if(result.events[i].hasOwnProperty('eventMediaCaption') && result.events[i].eventMediaCaption != ""){var mediaCaption = result.events[i].eventMediaCaption } else {var mediaCaption= ""}
						
						
						var divImageStory= '<span class="imgContent"><a href="'+result.events[i].eventMedia+'" target="_blank"><img class="sectionImage" src="'+result.events[i].eventMedia+'"></a></span>'
						divImageStory += "</br><i>" + mediaCaption + "</i>"
					
					}
				
				///////////////NEW Media of event (images [object] and video (string) are separated)
				//event images
				} else if(result.events[i].hasOwnProperty('eventMedia') && Array.isArray(result.events[i].eventMedia)){
					
					var divImageStory="";
					for(var iImg=0; iImg<result.events[i].eventMedia.length; iImg++){
						divImageStory += '<span class="imgContent"><a href="'+result.events[i].eventMedia[iImg]+'" target="_blank"><img class="sectionImage" src="'+result.events[i].eventMedia[iImg]+'"></a></span>'
						divImageStory += "</br><i>" + result.events[i].eventMediaCaption[iImg] + "</i></br>"				
					}
				
				//event video
				} else if(result.events[i].hasOwnProperty('eventVideo') && result.events[i].eventVideo != ""){

					//media caption
					if(result.events[i].hasOwnProperty('eventVideoCaption') && result.events[i].eventVideoCaption != ""){var mediaCaption = result.events[i].eventVideoCaption } else {var mediaCaption= ""}

						var divImageStory= convertYouTubeLinkToIframe(result.events[i].eventVideo)
						divImageStory += "</br><i>" + mediaCaption + "</i>"						
				
				
				/////////////// Images in the old library (media.url)
				} else if(result.events[i].hasOwnProperty('media') && result.events[i].media.url != "") {
					
					var divImageStory= '<span class="imgContent"><a href="'+result.events[i].media.url+'" target="_blank"><img class="sectionImage" src="'+result.events[i].media.url+'"></a></span>'
				
				////////////// No Media event
				} else {
					var divImageStory= "";
				}
			
			
			////////Type of slides///////////
			
			// Type MAP: if there are coordinate points or polygon
			if((result.events[i].hasOwnProperty('latitud') && result.events[i].latitud != "") || (result.events[i].hasOwnProperty('polygon') &&  result.events[i].polygon != "")){
				
				var event = result.events[i]; 
			

				
				// attach element (title, img, description...) to slide
				$(".storymap-story").append(""+
					'<section data-number-scene="'+numberScene+'" data-scene="scene'+numberScene+'" data-ev-id="'+result.events[i]._id+'" class="sectionSlide geoMapSlide" id="scene'+numberScene+'">' +
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
				var entityNameForEventGeometry= "";
				var idEntChosen= "";
				
				for(var idEnt of Object.keys(result.events[i].props)){
					console.log(result.items[idEnt])
					// consider only if the entity has coordinates (poligon, multipolygon, point)
					if(result.items[idEnt].hasOwnProperty('coordinatesPoint') || result.items[idEnt].hasOwnProperty('coordinatesPolygon')){
				
						var entityNameForEventGeometryFound= false;
						//console.log("ciaoM")
						//console.log(result.events[i].props[idEnt])
						var PolygonSingleEntity= result.items[idEnt].coordinatesPolygon
						if(PolygonSingleEntity===undefined){PolygonSingleEntity=""}
						var PointSingleEntity= result.items[idEnt].coordinatesPoint
						if(PointSingleEntity===undefined){PointSingleEntity=""}
						console.log("poligono e punto dell'entità: " + idEnt)
						console.log("Punto: " + PointSingleEntity)
						console.log("Poligono: " + PolygonSingleEntity)
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

										layer.bindPopup("");
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
			
			
			// type SKETCHFAB: if there is a 3d model )
			}  else if(result.events[i].hasOwnProperty('sketchfabid')){



				var event = result.events[i]; 
			

				
				// attach element (title, img, description...) to slide
				$(".storymap-story").append(""+
					
					'<section data-sketchfabid="'+result.events[i].sketchfabid+'" data-number-scene="'+numberScene+'" data-scene="scene'+numberScene+'" data-ev-id="'+result.events[i]._id+'" class="sectionSlide threeDModelSection" id="scene'+numberScene+'" data-background="model3D" style="width:100%" data-coordinate3d="'+result.events[i].annotationNumber3DModel+'">' +
					'<div class="threeDModel">'+

					'<h2 class="sectionTitle">'+ result.events[i].text.headline +'</h2>' +
					divImageStory +
					'<p class="sectionDescription">' + result.events[i].text.text + '</p>' +

					'</div>'+
					'</section>'
					
				
				)

				//attach link of the model to button bottomleft
				if($('.controlsDown .general-controls').find('#credits-'+result.events[i].sketchfabid).length == 0) {
					$(".controlsDown .general-controls").append('<div class="3dcredits credits3d" id="credits-'+result.events[i].sketchfabid+'" style="border-radius:15px;display:none;position:absolute;min-width: 180px;height: 32px;margin: 0;border: 1px solid black;padding: 0px 8px 0px 8px;background:rgba(225, 225, 225, 1);pointer-events: auto;text-align: center; align-items: center; justify-content: center; "><a target="_blank" href="https://sketchfab.com/3d-models/'+result.events[i].sketchfabid+'">Model on Sketchfab</a></div>')
				}				

				scenes["scene"+numberScene] = {"lat" : 46.78203732560553, "lng": 12.82666424871100, "zoom": 5, "name" : result.events[i].text.headline, layers : []}
			
				numberScene ++
			
			// Type slide
			} else {

				var event = result.events[i]; 
				
				if(result.events[i].hasOwnProperty("slidePosition") && result.events[i].slidePosition == "center"){
					var classSlidePosition= "justify-content: center !important; width:80wh !important"
				}else {
					var classSlidePosition= "justify-content: flex-start !important;"
				}
				
				//////// per violini sfondo nero
				if(result.events[i].text.headline == "La viola da gamba a Montecastelli Pisano" || result.events[i].text.headline == "La viola a Montecastelli Pisano" || result.events[i].text.headline == "Un po' di storia"){
					var stileS= "style='max-height: 80vh !important; position: absolute !important; background: rgba(0, 0, 0, 0.5) !important; top: 50px !important; padding-top: 20px !important; height:auto !important'"
				} else {
					var stileS= ""
				}
							
				// attach element (title, img, description...) to slide
				$(".storymap-story").append(""+
					
					'<section data-number-scene="'+numberScene+'" data-scene="scene'+numberScene+'" data-ev-id="'+result.events[i]._id+'" id="scene'+numberScene+'" data-background="'+result.events[i].backgroundImg+'" class="sectionSlide">' +
					'<div class="fullscreen2 text-center" style="'+classSlidePosition+'">'+
					'<div class="contentSlideFullscreen" '+stileS+'>' +
					'<h1 class="display-4 d-flex justify-content-center" id="titleSlide" style="white-space: normal !important; color: rgba(255, 255, 255, 0.95) !important; text-shadow: 0 0 BLACK;">'+ result.events[i].text.headline +'</h1>' +
					'<p class="d-flex justify-content-center" style="color: rgba(255, 255, 255, 0.95); padding-left:5%; padding-right:5%">'+ result.events[i].text.text +'</p>'+
					divImageStory +
					'</div>'+
					'</div>'+
					'</section>'
					
				
				)	

				scenes["scene"+numberScene] = {"lat" : 46.78203732560553, "lng": 12.82666424871100, "zoom": 5, "name" : result.events[i].text.headline, layers : []}
			
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
			legend: false,
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
					//$("#arrowUp").attr("style","display: none !important")
					$(".controlsUp").attr("style","display: none !important")
				} else {
					//$("#arrowUp").css("display","flex")
					$(".controlsUp").css("display","flex")
				}
				
				
				//if we are in a slide with sketchfab model...
				var sketchfabidslide = $("#"+currentVisibleSectionId).data('sketchfabid');
				//console.log(coordinate3d)
				if (typeof sketchfabidslide !== 'undefined') {
						
					$(".sketchfab-embed-wrapper").css( "display","none" ); //nasconde tutti i modelli 3d
					$(".leaflet-right").css( "display","none" );
					$("#sketchfab-embed-wrapper-"+sketchfabidslide).css( "display","block" ); //visualizza solo quello corrente
					$(".leaflet-map-pane").css( "opacity","0" );
					//$(".general-controls .control").show()
					$(".3dcredits").hide()
					$("#credits-"+sketchfabidslide).css("display","flex")

					
				} else {

					
					$(".sketchfab-embed-wrapper").css( "display","none" );
					$(".leaflet-right").css( "display","block" );
					$(".leaflet-map-pane").css( "opacity","1" );
					//$(".general-controls .control").hide()
					$(".3dcredits").hide()
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


/*  function clickOnIfrButton(id){
	$("#"+id).css("pointer-events", "none");
	//$("#"+id).click();
	console.log(id)
	
}  */

/* function showHideSketchfabButtons(){
	
	if($(".controlToHid").css("pointer-events") == "auto"){
		$(".controlToHid").css("pointer-events", "none")
		$("#controlbuttonShowHide button").css("background-color","red")
	} else {
	
		$(".controlToHid").css("pointer-events", "auto")
		$("#controlbuttonShowHide button").css("background-color","buttonface")
	}
} */

    function convertYouTubeLinkToIframe(url) {
        // Estrai l'ID del video e il tempo di inizio dall'URL
        const urlParams = new URLSearchParams(new URL(url).search);
        const videoId = urlParams.get('v');
        let startTime = urlParams.get('t');

        // Crea l'URL per l'iframe
        let iframeUrl = `https://www.youtube.com/embed/${videoId}`;
        if (startTime) {
			let startTimesoloNumeri = startTime.replace(/[^\d]/g, '');
            iframeUrl += "?start=" + startTimesoloNumeri;
        }

        // Crea l'elemento iframe
        const iframe = document.createElement('iframe');
        iframe.width = '560';
        iframe.height = '315';
        iframe.src = iframeUrl;
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        return iframe.outerHTML
    }














