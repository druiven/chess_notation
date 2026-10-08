<?php
declare(strict_types=1);

define('SCHAAK_API', true);
require_once __DIR__ . '/auth.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/include/php_head.php';

header('Content-Type: application/json');

function schaak_fail(int $code, string $msg): void
{
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') schaak_fail(405, 'method');
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) schaak_fail(415, 'content-type');

$raw = file_get_contents('php://input', false, null, 0, 70000);
$data = json_decode((string)$raw, true);
if (!is_array($data)) schaak_fail(400, 'json');

$pgn = trim((string)($data['pgn'] ?? ''));
if ($pgn === '' || strlen($pgn) > 60000) schaak_fail(400, 'pgn');

$clean = static function ($v, string $default): string {
    $v = trim(preg_replace('/[\x00-\x1F\x7F]/u', '', (string)$v) ?? '');
    $v = mb_substr($v, 0, 80);
    return $v === '' ? $default : $v;
};

try {
    $db = new SiteDb(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
    $db->insert('schaak_game', [
        'white_name' => $clean($data['white'] ?? '', 'Wit'),
        'black_name' => $clean($data['black'] ?? '', 'Zwart'),
        'pgn' => $pgn,
        'pgn_hash' => hash('sha256', $pgn),
    ]);
    echo json_encode(['ok' => true, 'saved' => true]);
} catch (PDOException $e) {
    // 23000 = duplicate pgn_hash: same game was already saved
    if ($e->getCode() === '23000') {
        echo json_encode(['ok' => true, 'saved' => false]);
    } else {
        error_log('schaak save: ' . $e->getMessage());
        schaak_fail(500, 'db: ' . $e->getMessage());
    }
} catch (Throwable $e) {
    error_log('schaak save: ' . $e->getMessage());
    $detail = isset($db) ? implode(' | ', $db->getErrors()) : '';
    schaak_fail(500, 'db: ' . ($detail !== '' ? $detail : $e->getMessage()));
}
