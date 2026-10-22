<?php
$data_dir  = '/home/YOUR_USER/exp_data/my_experiment'; // OUTSIDE the Application folder
$max_bytes = 5 * 1024 * 1024;

function fail($code, $msg) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405, 'POST only.');
$raw = file_get_contents('php://input', false, null, 0, $max_bytes + 1);
if ($raw === false || $raw === '' || strlen($raw) > $max_bytes) fail(413, 'Empty or too large.');
$payload = json_decode($raw, true);
if (!is_array($payload)) fail(400, 'Invalid JSON.');
if (!is_dir($data_dir) && !mkdir($data_dir, 0700, true)) fail(500, 'Storage unavailable.');

$name = gmdate('Ymd-His') . '_' . bin2hex(random_bytes(6)) . '.json'; // never from the request
$ok = file_put_contents($data_dir . '/' . $name, json_encode($payload), LOCK_EX);
if ($ok === false) fail(500, 'Write failed.');
@chmod($data_dir . '/' . $name, 0600);

header('Content-Type: application/json');
echo json_encode(['success' => true]);