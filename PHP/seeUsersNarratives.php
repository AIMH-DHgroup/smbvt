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
	
	if(isset($_GET["idU"])){
		
		
		
		
			$query = "select id_dbname, id, subject, title, narrations.user, copied_from from narrations where narrations.user  = '" . $_GET["idU"] . "'";
			$result = pg_query($query) or die('Error message: ' . pg_last_error());
			$arr= [];
			while ($row = pg_fetch_row($result)) {
				array_push($arr,$row);
			}
			pg_free_result($result);
			
		
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

	$('#datatable2').DataTable();

	$("#content").on('change', 'input[type=radio][name=users]', function() {
	
	
		//var valNarr = $('input:radio[name=radNarr]:checked').val();
		
		var valUser = $('input:radio[name=users]:checked').val().split("|")[0];
		var Username = $('input:radio[name=users]:checked').val().split("|")[1];
		

		

		console.log(valUser)

  		$.ajax({
			   type:"GET",
			   url:"seeUsersNarratives.php",
			   dataType:"JSON",
			   data:{idU: valUser, usN: Username},
			   success: function(data){
					console.log(data.response)
					
					$("#datatable3").empty()
					$("#datatable3").append("<thead><tr> <th>Id</th> <th>Title</th> <th></th> </tr></thead><tbody>")
					
					for(var i=0; i<data.response.length; i++){
						$("#datatable3").append("<tr>" + "<td>" + data.response[i][1] + "</td>" + "<td>" + data.response[i][3] + "</td>" + "<td><a href='../toolUser.php?idwiki="+data.response[i][2].toUpperCase()+"&idnar="+data.response[i][1]+"&user="+Username.replace(/-/g, '').replace(/ /g,'')+"&idUser="+valUser+"'><button>Conferma</button></a></td> </tr>")
					}
					
	
					if ( $.fn.DataTable.isDataTable( '#datatable3' ) ) {
						$('#datatable3').DataTable().destroy();
					}   
					$('#datatable3').DataTable({
						order: [0]
					});
			   
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
<div id="content">

<?php

	
	$query = "select users.id, users.username, users.email, users.password from users order by users.id desc";
	$result = pg_query($query) or die('Error message: ' . pg_last_error());
	
	echo "<h1>Selcet a user to see their narratives</h1>";
	echo "<table id='datatable2'>";
	echo "<thead><tr> <th>id username</th> <th>username</th> <th>email</th> <th>rat</th> <th></th> </tr> </thead>";
	echo "<tbody>";
  	while ($row = pg_fetch_row($result)) {
		echo "<tr>";
		echo "<td>" .$row[0] ."</td>";
		echo "<td>" .$row[1] ."</td>";
		echo "<td>" .$row[2] ."</td>";
		echo "<td>" .$row[3] ."</td>";
		echo "<td><input name='users' type='radio' name='radUser' value='".$row[0]."|".$row[1]."'></td>";
		echo "</tr>";
	}
	echo"</tbody></table>";
	pg_free_result($result);
	
	echo "</br></br>";



?>
<h1>Narratives</h1>
<table id='datatable3'>
</table>

</div>
</body>
</html>
