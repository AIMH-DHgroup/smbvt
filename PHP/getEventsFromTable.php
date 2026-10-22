<?php
//require('PgConn.php');

// --- diagnostica forte a schermo e su file ---
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// prepara cartella CSV con percorso assoluto
$baseDir = __DIR__;
$csvDir  = $baseDir . DIRECTORY_SEPARATOR . 'CSV';
$logFile = $csvDir . DIRECTORY_SEPARATOR . 'export_errors.log';

if (!is_dir($csvDir)) {
    if (!mkdir($csvDir, 0777, true)) {
        die("ERRORE: impossibile creare la cartella CSV in: $csvDir");
    }
}

// logga anche su file
ini_set('log_errors', 1);
ini_set('error_log', $logFile);

function logmsg($m) {
    echo $m . "\n";
    error_log($m);
}

header('Content-Type: text/plain; charset=utf-8');
logmsg("Base dir: $baseDir");
logmsg("CSV dir:  $csvDir");
logmsg("User PHP:  " . get_current_user());

// --- trova le tabelle che contengono 'moving' ---
$sqlTables = "
  SELECT n.nspname AS schema_name, c.relname AS table_name
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind IN ('r','p')
    AND c.relname ILIKE '%moving%'
    AND n.nspname NOT IN ('pg_catalog','information_schema','pg_toast')
    AND n.nspname NOT LIKE 'pg_temp_%'
  ORDER BY n.nspname, c.relname
";

$resTables = pg_query($sqlTables);
if (!$resTables) {
    die('ERRORE query tabelle: ' . pg_last_error());
}

$tables = [];
while ($t = pg_fetch_assoc($resTables)) {
    $tables[] = $t;
}
logmsg("Tabelle trovate con 'moving' nel nome: " . count($tables));
if (empty($tables)) {
    logmsg("Nessuna tabella trovata. Verifica i nomi reali nel DB.");
}

$created = 0;

foreach ($tables as $t) {
    $schema = $t['schema_name'];
    $table  = $t['table_name'];
    $qualified = pg_escape_identifier($schema) . '.' . pg_escape_identifier($table);

    logmsg("Elaboro: {$schema}.{$table}");

    $query = "
      SELECT value, id
      FROM $qualified
      WHERE id ~ '^ev'
      ORDER BY (value->>'position')::int
    ";
    $result = pg_query($query);
    if (!$result) {
        logmsg("  ERRORE query su {$schema}.{$table}: " . pg_last_error());
        continue;
    }

    $events = [];
    while ($row = pg_fetch_assoc($result)) {
        $eventJson = json_decode($row['value']);
        if (json_last_error() !== JSON_ERROR_NONE) {
            logmsg("  JSON non valido in {$schema}.{$table} (id={$row['id']}): " . json_last_error_msg());
            continue;
        }
        if (isset($eventJson->description)) {
            $events[] = $eventJson->description;
        }
    }

    $entireNarrative = trim(implode(' ', array_map('strip_tags', $events)));

    // filename sicuro nella cartella CSV
    $safeSchema = preg_replace('/[^A-Za-z0-9_-]+/', '_', $schema);
    $safeTable  = preg_replace('/[^A-Za-z0-9_-]+/', '_', $table);
    $filename   = $csvDir . DIRECTORY_SEPARATOR . "export_{$safeSchema}_{$safeTable}.csv";

    $fp = fopen($filename, 'w');
    if (!$fp) {
        logmsg("  ERRORE apertura file CSV: $filename");
        continue;
    }

    // intestazioni (riga 1)
    fputcsv($fp, ['Label', 'Text']);
    // dati (riga 2)
    fputcsv($fp, ['Narrative', $entireNarrative]);
    fclose($fp);

    $created++;
    logmsg("  Creato CSV: $filename");
}

logmsg("Completato. File creati: $created");
