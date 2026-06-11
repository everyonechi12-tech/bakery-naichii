<?php
require_once __DIR__ . '/config.php';

$message = '';
$error = '';
$installed = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $sqlFile = __DIR__ . '/../mysql';
    if (!file_exists($sqlFile)) {
        $error = 'File SQL schema tidak ditemukan.';
    } else {
        $sql = file_get_contents($sqlFile);
        if ($sql === false) {
            $error = 'Gagal membaca file SQL schema.';
        } else {
            if ($mysqli->multi_query($sql)) {
                do {
                    if ($result = $mysqli->store_result()) {
                        $result->free();
                    }
                } while ($mysqli->more_results() && $mysqli->next_result());

                $hash = password_hash('admin123', PASSWORD_DEFAULT);
                $stmt = $mysqli->prepare('INSERT IGNORE INTO bakery_chii.users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?);');
                $adminEmail = 'admin@bakerynaichii.com';
                $adminName = 'Admin Bakery';
                $adminRole = 'admin';
                $stmt->bind_param('sssss', $adminUser, $adminEmail, $hash, $adminName, $adminRole);
                $adminUser = 'admin';
                $stmt->execute();
                $stmt->close();
                $installed = true;
                $message = 'Database berhasil dibuat. Login admin: admin / admin123';
            } else {
                $error = 'Eksekusi SQL gagal: ' . $mysqli->error;
            }
        }
    }
}
?>
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Install PHP Admin - Bakery Naichii</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="admin-wrap">
        <h1>Install Database</h1>
        <?php if ($message): ?>
            <div class="alert success"><?= htmlspecialchars($message) ?></div>
        <?php endif; ?>
        <?php if ($error): ?>
            <div class="alert error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>
        <p>Tekan tombol install untuk membuat database MySQL dan akun admin default.</p>
        <form method="post">
            <button type="submit" class="btn">Install Database</button>
        </form>
        <?php if ($installed): ?>
            <p>Jika sudah selesai, buka <a href="login.php">Login Admin</a>.</p>
        <?php endif; ?>
    </div>
</body>
</html>
