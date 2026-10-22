<?php
	require('PgConn.php');
	
	if (session_status() === PHP_SESSION_NONE) {
		session_start();
	}
	if(!isset($_SESSION['login_user'])){
		die("not logged");
	}
	if($_SESSION['id_user'] != 1){
		die("not permission");
	}
	
	if(isset($_POST["idN"]) && isset($_POST["idU"])){
		
		$arrayOfIdNarratives= $_POST["idN"];
		
		for($i=0; $i < sizeOf($arrayOfIdNarratives); $i++){
			$query = "select id_dbname, id, subject, title, narrations.user, copied_from from narrations where id = '" . $arrayOfIdNarratives[$i] . "'";
			$result = pg_query($query) or die('Error message: ' . pg_last_error());
			$arr= [];
			while ($row = pg_fetch_row($result)) {
				array_push($arr,$row);
			}
			pg_free_result($result);
			
			$query = "INSERT INTO narrations (id_dbname, id, subject, title, \"user\", copied_from) VALUES ('".$arr[0][0]."','".$arr[0][1]."','".$arr[0][2]."','".pg_escape_string($arr[0][3])."','".$_POST["idU"]."','".explode("-",$arr[0][0])[0]."')";
			$result = pg_query($query) or die('Error message: ' . pg_last_error());
			pg_free_result($result);
		
		}
	
		$arrayJson= array("response"=> $arr);	
		$data= json_encode($arrayJson);
		echo $data;
		exit();
	}

?>

<html>
<head>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.12.1/css/jquery.dataTables.css">
<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.12.1/js/jquery.dataTables.js"></script>

<script>
$(document).ready( function () {
    $('#datatable1').DataTable();
	$('#datatable2').DataTable();

	
	$("#conf").on("click", function(){
	
		//var valNarr = $('input:radio[name=radNarr]:checked').val();
		
		var valUser = $('input:radio[name=radUser]:checked').val();
		var valNarr = [];
		$("input:checkbox[name=radNarr]:checked").each(function(){
			valNarr.push($(this).val());
		});
		
		console.log(valNarr)
		console.log(valUser)

 		$.ajax({
			   type:"POST",
			   url:"assignNarrativeTo.php",
			   dataType:"JSON",
			   data:{idN: valNarr, idU: valUser},
			   success: function(data){
				alert("Assegnate! Apri la console per vedere il risultato")
				console.log(data)
			   
			   },
			   error: function(d){
				console.log(d)
			   }
		   }); 
		

	
	})

} );
</script>

<style>

table tr.odd {
    background-color: #F3F3F3 !important;
}
table tr .even {
    background-color: white !important;
}
</style>

</head>
<body>
<h1>Select narratives to copy</h1>
<?php

	
	$query = "select users.id, users.username, users.email, narrations.title, narrations.id, narrations.copied_from from users join narrations on narrations.user = users.id order by narrations.id desc";
	$result = pg_query($query) or die('Error message: ' . pg_last_error());
	
	echo "<table id='datatable1'>";
	echo "<thead><tr> <th>id username</th> <th>username</th> <th>email</th> <th>id narrative</th> <th>narrative</th> <th>copied from</th> <th></th> </tr> </thead>";
	echo "<tbody>";
  	while ($row = pg_fetch_row($result)) {
		echo "<tr>";
		echo "<td>" .$row[0] ."</td>";
		echo "<td>" .$row[1] ."</td>";
		echo "<td>" .$row[2] ."</td>";
		echo "<td>" .$row[3] ."</td>";
		echo "<td>" .$row[4] ."</td>";
		echo "<td>" .$row[5] ."</td>";
		if($row[5] == null){
			$checkboxdisable= "";
		} else {
			$checkboxdisable= "disabled";
		}
		echo "<td><input type='checkbox' name='radNarr' value='".$row[4]."' ".$checkboxdisable."></td>";
		echo "</tr>";
	}
	echo"</tbody></table>";
	pg_free_result($result);


	$query = "select users.id, users.username, users.email from users order by users.id desc";
	$result = pg_query($query) or die('Error message: ' . pg_last_error());
	
	echo "<h1>Selcet a user to copy the narratives to</h1>";
	echo "<table id='datatable2'>";
	echo "<thead><tr> <th>id username</th> <th>username</th> <th>email</th> <th></th> </tr> </thead>";
	echo "<tbody>";
  	while ($row = pg_fetch_row($result)) {
		echo "<tr>";
		echo "<td>" .$row[0] ."</td>";
		echo "<td>" .$row[1] ."</td>";
		echo "<td>" .$row[2] ."</td>";
		echo "<td><input type='radio' name='radUser' value='".$row[0]."'></td>";
		echo "</tr>";
	}
	echo"</tbody></table>";
	pg_free_result($result);
	
	echo "</br></br>";
	echo "<button id='conf'>conferma</button>"


?>
</body>
</html>
