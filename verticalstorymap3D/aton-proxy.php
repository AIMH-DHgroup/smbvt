<?php
declare(strict_types=1);

$path = $_SERVER['PATH_INFO'] ?? '';
$path = ltrim($path, '/');

if ($path === '' || strpos($path, '..') !== false) {
    http_response_code(400);
    echo 'Invalid ATON proxy path';
    exit;
}

$allowedPrefixes = [
    'api/v2/',
    'collections/',
    'dist/',
    'hathor/',
    'res/',
    'src/',
    'vendors/',
];

$allowed = false;
foreach ($allowedPrefixes as $prefix) {
	if (strpos($path, $prefix) === 0) {
        $allowed = true;
        break;
    }
}

if (!$allowed) {
    http_response_code(403);
    echo 'ATON proxy path not allowed';
    exit;
}

$url = 'https://aton.ispc.cnr.it/' . implode('/', array_map('rawurlencode', explode('/', $path)));
if ($_SERVER['QUERY_STRING'] ?? '') {
    $url .= '?' . $_SERVER['QUERY_STRING'];
}

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 60,
    CURLOPT_HTTPHEADER => ['Accept: */*'],
]);

$body = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$error = curl_error($ch);
curl_close($ch);

if ($body === false || $status < 200 || $status >= 300) {
    http_response_code($status >= 400 ? $status : 502);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => 'Errore nel proxy ATON.',
        'path' => $path,
        'status' => $status,
        'details' => $error ?: null,
    ]);
    exit;
}

$extension = strtolower(pathinfo(parse_url($path, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION));
$contentTypes = [
    'bin' => 'application/octet-stream',
    'css' => 'text/css; charset=utf-8',
    'gltf' => 'model/gltf+json; charset=utf-8',
    'glb' => 'model/gltf-binary',
    'html' => 'text/html; charset=utf-8',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'js' => 'text/javascript; charset=utf-8',
    'json' => 'application/json; charset=utf-8',
    'ktx2' => 'image/ktx2',
    'png' => 'image/png',
    'svg' => 'image/svg+xml',
    'ttf' => 'font/ttf',
    'wasm' => 'application/wasm',
    'woff' => 'font/woff',
    'woff2' => 'font/woff2',
];

header('Content-Type: ' . ($contentTypes[$extension] ?? $contentType ?? 'application/octet-stream'));
header('Cache-Control: public, max-age=3600');
echo $body;
