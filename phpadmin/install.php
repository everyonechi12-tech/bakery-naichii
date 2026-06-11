<?php
require_once __DIR__ . '/config.php';

$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $sqlFile = __DIR__ . '/../mysql';
    if (!file_exists($sqlFile)) {
        $error = 'File SQL schema tidak ditemukan.';
    } else {
        $sql = file_get_contents($sqlFile);
        if ($sql === false) {
            $error = 'Gagal membaca file SQL schema.';
        } else {
            if (get_mysqli()->multi_query($sql)) {
                do {
                    if ($result = get_mysqli()->store_result()) {
                        $result->free();
                    }
                } while (get_mysqli()->more_results() && get_mysqli()->next_result());

                if (!get_mysqli()->select_db(DB_NAME)) {
                    $error = 'Database dibuat tetapi tidak dapat dipilih: ' . get_mysqli()->error;
                } else {
                    $hash = password_hash('admin123', PASSWORD_DEFAULT);
                    $stmt = get_mysqli()->prepare('INSERT IGNORE INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)');
                    $adminEmail = 'admin@bakerynaichii.com';
                    $adminName = 'Admin Bakery';
                    $adminRole = 'admin';
                    $adminUser = 'admin';
                    $stmt->bind_param('sssss', $adminUser, $adminEmail, $hash, $adminName, $adminRole);
                    $stmt->execute();
                    $stmt->close();
                    $message = 'Database berhasil dibuat. Login admin: admin / admin123';
                }
            } else {
                $error = 'Eksekusi SQL gagal: ' . get_mysqli()->error;
            }
        }
    }
}
?><!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Install Database - Bakery Naichii</title>
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
        <p>Tekan tombol untuk membuat database dan akun admin default.</p>
        <form method="post">
            <button type="submit" class="btn">Jalankan Install</button>
        </form>
        <p><a href="login.php">Ke login admin</a></p>
    </div>
</body>
</html>
