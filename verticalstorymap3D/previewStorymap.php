

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
	
	<link href="../lib/narra.css" rel="stylesheet">

    <!--add favicon for the web page-->
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">

    <!--Font-->
    <link href="https://fonts.googleapis.com/css?family=Cairo" rel="stylesheet">

	<link rel="stylesheet" type="text/css" href="storymap.2.5.css">
	<link href="vertical-storymap-ui.css" rel="stylesheet">

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
    <script src="globeminimap.js"></script>
	
	<!--WKT to GeoJson-->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/wicket/1.3.8/wicket.min.js"></script>
	
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/fontawesome.min.css"> 

	<script>
	var actualScene=1
	</script>
    <!--story map plugin-->
    <script src="storymap.2.5.js"></script>
	

	<!--font-awesome-->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
	
	
	<script type="text/javascript" src="https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js"></script>
	

</head>
<body class="vertical-storymap is-preview">
<div id="hideAll"><img src="loading2.gif"></div>

<div id="storymap" class="container-fluid">
    <div class="row">
        <div class="col-sm-6 col-md-8 storymap-map">
		</div>
        <div class="col-sm-6 col-md-4 storymap-story">
			
			
            <section data-scene="scene1" id="scene1" data-background="" class="sectionSlide" data-number-scene="1">
			
                <div class="fullscreen text-center">
					
					<h1 class="display-4 d-flex justify-content-center" id="titleSlide"></h1>
					<small class="d-flex justify-content-center" id="subTitleSlide">
					</small>
					<small class="d-flex justify-content-center"></small>
                </div>
            </section>
			
			
             
			

		
		</div>
    </div>
</div>

<div id="arrowUp" class="zoomIn material-icons d-flex fixed-top mt-1 storymap-scroll-top justify-content-center">keyboard_arrow_up</div>
<div id="arrowDown" class="zoomIn material-icons d-flex fixed-bottom mb-1 storymap-scroll-down justify-content-center">keyboard_arrow_down</div>

<!-- <div class="d-flex fixed-bottom justify-content-left"><div class="zoomIn material-icons storymap-scroll-down">keyboard_arrow_down</div></div> -->


<div class="controlsUp">
	
	
    <div class="hotspot-controls storymap-scroll-top1">
		<div class="hotspot-name material-icons">keyboard_arrow_up</div>
    </div>


    <div class="general-controls"></div>
                    
</div>

<div class="controlsDown">
		
	<div class="storymap-scroll-down1-container">
	
		<div class="hotspot-controls storymap-scroll-down1">
			<div class="hotspot-name material-icons"></div>
		</div>
	
	</div>


    <div class="general-controls">

<!--    <div class="control" id="controlbuttonShowHide" onclick="showHideSketchfabButtons()" style="pointer-events: auto; display:none">
			 <button style="width:100%; height:100%; border-radius: 15px;"><i class="fa-solid fa-eye-slash"></i></button> 
        </div>
                                
                                
        <div class="control controlToHid" id="control1button" style="right:46px; pointer-events: auto; display:none">
 
         </div>
                                
                                
        <div class="control controlToHid" id="control2button" style="right:82px; pointer-events: auto; display:none" >

        </div>
                                
                                
        <div class="control controlToHid" id="control3button" style="right:118px; pointer-events: auto; display:none">

        </div>
                                
                                
                                
        <div class="control controlToHid" id="control4button" style="right:154px; pointer-events: auto; display:none">

        </div> -->
                                
                                
         <!-- <div class="3dcredits" style="border-radius:15px;display:none;position:absolute;min-width: 180px;height: 32px;margin: 0;border: 1px solid black;padding: 0px 8px 0px 8px;background-color:white;pointer-events: auto;text-align: center; align-items: center; justify-content: center; ">View model on Sketchfab</div>                    -->
	
	
	
	</div>
                    
</div>



<script src="visualizeOrizontalStorymapIndex.js"></script>
<script>
//display all when all the bjects in the page are loaded
window.onload = function() 
{ 
document.getElementById("hideAll").style.display = "none"; 


//delete temp json after load for preview
$.ajax({
    dataType: "json",
    url: "../PHP/deletTempJson.php",
	type:"POST",
	data: {tempJsonToDelete: user+"-"+id+"-slide.json" },
    mimeType: "application/json",
    success: function(result){
		console.log(result.msg)
		console.log(id)
		console.log(user)
	}
})


};
</script>

</body>
</html>
