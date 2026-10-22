<?php


//$dbconn = pg_connect("host=$dbhost dbname=$dbname user=$dbuser password=$dbpass")
    or die('Could not connect: ' . pg_last_error());

// Recupera tutte le tabelle del database
$result = pg_query($dbconn, "
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename LIKE '%demo%';
") or die('Query failed: ' . pg_last_error());

// Cicla sulle tabelle e le elimina
while ($row = pg_fetch_assoc($result)) {
    $table = $row['tablename'];
    echo "Dropping table: $table\n";
    $dropQuery = "DROP TABLE IF EXISTS \"$table\" CASCADE;";
    pg_query($dbconn, $dropQuery) or die('Error dropping table '.$table.': ' . pg_last_error());
}

echo "Tutte le tabelle contenenti 'demo' sono state eliminate.\n";

pg_close($dbconn);
?>
