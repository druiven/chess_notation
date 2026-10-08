<?php
declare(strict_types=1);

define('SCHAAK_API', true);
require_once __DIR__ . '/auth.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/include/php_head.php';

header('Content-Type: application/json; charset=utf-8');

function schaak_games_fail(int $code, string $error): void
{
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $error]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') schaak_games_fail(405, 'method');

try {
    $db = new SiteDb(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
    if (!$db->dbconnect()) {
        error_log('schaak games: ' . implode(' | ', $db->getErrors()));
        schaak_games_fail(500, 'database');
    }

    if (isset($_GET['id'])) {
        $id = filter_var($_GET['id'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if ($id === false) schaak_games_fail(400, 'id');

        $result = $db->select(
            'SELECT `pgn` FROM `schaak_game` WHERE `id` = :id LIMIT 1',
            ['id' => $id]
        );
        if (empty($result['success'])) schaak_games_fail(500, 'database');
        if (empty($result['rows'])) schaak_games_fail(404, 'not-found');
        echo json_encode(['ok' => true, 'pgn' => $result['rows'][0]['pgn']]);
        exit;
    }

    $result = $db->select(
        'SELECT `id`, `played_at`, `white_name`, `black_name` FROM `schaak_game` ORDER BY `played_at` DESC, `id` DESC LIMIT 100'
    );
    if (empty($result['success'])) schaak_games_fail(500, 'database');
    echo json_encode(['ok' => true, 'games' => $result['rows']]);
} catch (Throwable $e) {
    error_log('schaak games: ' . $e->getMessage());
    schaak_games_fail(500, 'database');
}
