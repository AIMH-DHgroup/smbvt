

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
	<link href="movingStyle.css" rel="stylesheet">

    <!--add favicon for the web page-->
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">

    <!--Font-->
    <link href="https://fonts.googleapis.com/css?family=Cairo" rel="stylesheet">

    <link rel="stylesheet" type="text/css" href="storymap.2.5.css">

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
	
.api-frame {position: fixed;
z-index:3;
    top: 0;
    bottom: 0;
    right: 0;
    border-radius: 0;
    min-height: 100%;
    min-width: 100%;
    /* pointer-events: none; */
    display: block; }
	
.sketchfab-embed-wrapper{position:relative; display:none; z-index:901}

.threeDModel{
	
    position: relative;
    /*top: 50%;
    transform: translateY(-50%);
    height: 85vh; 
	*/
	top: 50px;
	max-height: 85vh;
    overflow-y: auto; /* Aggiungi scroll se il contenuto supera l'altezza */
	background: rgba(0, 0, 0, 0.5) !important;
	padding-left: 15px;
    padding-right: 15px;
	}

/*.threeDModel h5, .threeDModel .tl-entities {display:none}	*/




threeDModel::-webkit-scrollbar {
  width: 6px;               /* width of the entire scrollbar */
}

threeDModel::-webkit-scrollbar-track {
  background: transparent;        /* color of the tracking area */
}

threeDModel::-webkit-scrollbar-thumb {
  background-color: blue;    /* color of the scroll thumb */
  border-radius: 20px;       /* roundness of the scroll thumb */
  border: 2px solid orange;  /* creates padding around scroll thumb */
}


	
	
	
.threeDModelSection{
	background: transparent !important;
	box-shadow: none !important;
	
}








.threeDModel h2{

    /*font-family: Cairo, sans-serif;
    color: rgba(255, 255, 255, 0.95);
    font-size: 4vw;
    text-shadow: 0 0 6px rgba(0, 0, 0, .95);*/
	color: rgba(255, 255, 255, 0.95);
	font-size:2.1rem !important

} 

.threeDModel p{/*color: #1c1c1c */  color: rgba(255, 255, 255, 0.95);}


.contentSlideFullscreen{ 
height: 80vh;
    width: 50vw;
    overflow-x: auto;
	color: rgba(255, 255, 255, 0.95) !important;
}
.contentSlideFullscreen h1 {margin-top: 0px !important; font-size: 2.1rem !important;}
.contentSlideFullscreen p {font-size: 16px !important}

.contentSlideFullscreen .tl-entities a {background-color: white !important}
.contentSlideFullscreen .digObjList a {background-color: white !important; font-size: 90% !important}













/*frecce*/



.controlsDown {
    display: flex;
    justify-content: space-between;
    min-width: 0;
    padding: 10px;
    pointer-events: none;
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1002;
    height: 52px;
}

.controlsUp {
    display: none;
    justify-content: space-between;
    min-width: 0;
    padding: 10px;
    pointer-events: none;
    position: fixed;
    right: 0;
    top: 0;
    left: 0;
    z-index: 1002;
    height: 52px;
}



.hotspot-controls {
	display: flex;
	border:2px solid black;
    position: relative;

    flex: 0 1 auto;
    width: 281px;
    height: 32px;
    margin-left: auto;
    pointer-events: all;
    font-size: 13px;
    color: #fff;
    color: var(--color-neutral-0, #fff);
    background: rgba(225, 225, 225, 1);
    border-radius: 16px;
}

.storymap-scroll-down1-container{
	display: flex;
	border:0px;
    position: relative;
	margin:0px;
	padding:0px;

    flex: 0 1 auto;
    width: 281px;
    height: 32px;
    margin-left: auto;
    pointer-events: all;
    font-size: 13px;
    color: #fff;
    color: var(--color-neutral-0, #fff);
    background: rgba(225, 225, 225, 1);
    border-radius: 16px;
}

.general-controls {
    display: flex !important;
    flex-flow: row nowrap !important;
    justify-content: flex-end;
    flex: 0 0 auto;
    font-size: 13px;
    pointer-events: none;
    align-items: center;
    margin-left: auto;
    -moz-column-gap: 4px;
    column-gap: 4px;
}

.hotspot-name {
    padding: 0 10px;
    overflow: hidden;
    line-height: 30px;
    text-align: center;
    text-overflow: ellipsis;
    text-shadow: 0 0 10px #000;
    white-space: nowrap;
    cursor: pointer;
    flex: 1;
	color:black;
	font-size:20px
}

.hotspot-controls:hover{  box-shadow: inset 0 0 10px 0 rgba(0,0,0,0.7);}

.control {
	position:absolute;
    width: 32px;
    height: 32px;
    margin: 0;
	border: 0;
	padding: 0;

	}



#arrowDown{display:none !important}




/*scroll bar*/

/* width */
::-webkit-scrollbar {
  width: 6px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey; 
  border-radius: 10px;
}
 
/* Handle */
::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.4);
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.6);
}





/* Hide all at the beginning and show after the page is loaded*/	
#hideAll
 {
   position: fixed;
   left: 0px; 
   right: 0px; 
   top: 0px; 
   bottom: 0px; 
   background-color: white;
   z-index: 99999; /* Higher than anything else in the document */


 }
 
 #hideAll img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width:100%;
  width:8%
}
	</style>
	
</head>
<body>
<div style="display: block" id="hideAll"><img src="loading2.gif"></div>

<div id="storymap" class="container-fluid" style="visibility:hidden">
    <div class="row">
        <div class="col-sm-6 col-md-8 storymap-map">
		</div>
        <div class="col-sm-6 col-md-4 storymap-story">
			
			
            <section data-scene="scene1" id="scene1" data-background="" class="sectionSlide" data-number-scene="1">
			
                <div class="fullscreen text-center">
					
					<h1 class="display-4 d-flex justify-content-center" id="titleSlide" style="white-space: normal !important; color: rgba(255, 255, 255, 0.95) !important; text-shadow: 0 0 BLACK"></h1>
                    <small class="d-flex justify-content-center" style="color: rgba(255, 255, 255, 0.95); font-size:100% !important" id="subTitleSlide">
                    </small>
					<small class="d-flex justify-content-center" style="color: rgba(255, 255, 255, 0.95); font-size:100% !important"></small>
                </div>
            </section>
			
			
             
			

		
		</div>
    </div>
</div>

<div id="arrowUp" class="zoomIn material-icons d-flex fixed-top mt-1 storymap-scroll-top justify-content-center" style="display:none !important">keyboard_arrow_up</div>
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



<script src="visualizeOrizontalStorymapNew.js"></script>
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
