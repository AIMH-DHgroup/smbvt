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

	<script>
	var actualScene=1
	</script>
    <!--story map plugin-->
    <script src="storymap.2.5.js"></script>
	
	

	
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



<script src="visualizeOrizontalStorymapAllGeometry.js"></script>

</body>
</html>
