<?php
// Simple single-user password gate. Stateless signed cookie, so it survives session cleanup.
declare(strict_types=1);

$schaakCfg = require __DIR__ . '/config.php';
$schaakHash = (string)($schaakCfg['password_hash'] ?? '');

const SCHAAK_COOKIE = 'schaak_auth';
const SCHAAK_LIFETIME = 60 * 60 * 24 * 90;

function schaak_secure(): bool
{
    return !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
}

function schaak_set_cookie(string $value, int $expires): void
{
    setcookie(SCHAAK_COOKIE, $value, [
        'expires' => $expires,
        'path' => '/schaak/',
        'secure' => schaak_secure(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function schaak_token(int $expires, string $key): string
{
    return $expires . '.' . hash_hmac('sha256', (string)$expires, $key);
}

function schaak_authed(string $key): bool
{
    if ($key === '' || empty($_COOKIE[SCHAAK_COOKIE])) return false;
    $parts = explode('.', (string)$_COOKIE[SCHAAK_COOKIE], 2);
    if (count($parts) !== 2 || !ctype_digit($parts[0]) || (int)$parts[0] < time()) return false;
    return hash_equals(schaak_token((int)$parts[0], $key), (string)$_COOKIE[SCHAAK_COOKIE]);
}

if (isset($_GET['logout'])) {
    schaak_set_cookie('', time() - 3600);
    header('Location: ./');
    exit;
}

if (schaak_authed($schaakHash)) return;

// API callers get a status code instead of the login page
if (defined('SCHAAK_API')) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo '{"ok":false,"error":"unauthorized"}';
    exit;
}

$loginError = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if ($schaakHash !== '' && password_verify((string)$_POST['password'], $schaakHash)) {
        $expires = time() + SCHAAK_LIFETIME;
        schaak_set_cookie(schaak_token($expires, $schaakHash), $expires);
        header('Location: ./');
        exit;
    }
    usleep(800000);
    $loginError = true;
}
?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex">
    <title>Schaak - Inloggen</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
    <form method="post" class="bg-white rounded-lg shadow p-6 w-full max-w-xs space-y-4">
        <h1 class="text-lg font-bold text-slate-700">Schaak Notatie</h1>
        <?php if ($loginError): ?><p class="text-sm text-red-600">Onjuist wachtwoord.</p><?php endif; ?>
        <input type="password" name="password" placeholder="Wachtwoord" autofocus required
            class="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500">
        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded">Openen</button>
    </form>
</body>
</html>
<?php exit;
