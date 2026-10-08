<?php
declare(strict_types=1);

define('SCHAAK_API', true);
require_once __DIR__ . '/auth.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/include/php_head.php';

header('Content-Type: application/json; charset=utf-8');

function schaak_delete_fail(int $code, string $error): void
{
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $error]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') schaak_delete_fail(405, 'method');
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) schaak_delete_fail(415, 'content-type');

$data = json_decode((string)file_get_contents('php://input', false, null, 0, 1000), true);
if (!is_array($data)) schaak_delete_fail(400, 'json');

$id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
if ($id === false) schaak_delete_fail(400, 'id');

try {
    $db = new SiteDb(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
    $deleted = $db->deleteById('schaak_game', 'id', $id);
    if ($deleted !== 1) schaak_delete_fail(404, 'not-found');
    echo json_encode(['ok' => true]);
} catch (Throwable $e) {
    error_log('schaak delete: ' . $e->getMessage());
    schaak_delete_fail(500, 'database');
}
