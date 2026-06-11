<?php
require_once __DIR__ . '/config.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($username === '' || $password === '') {
        $error = 'Isi username dan password.';
    } else {
        $stmt = db()->prepare('SELECT id, username, password FROM users WHERE username = ? AND role = ? LIMIT 1');
        $role = 'admin';
        $stmt->bind_param('ss', $username, $role);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_user'] = $user['username'];
            header('Location: dashboard.php');
            exit;
        }

        $error = 'Username atau password admin salah.';
    }
}
?>
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin Login - Bakery Naichii</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="admin-wrap">
        <h1>Admin Login</h1>
        <?php if ($error): ?>
            <div class="alert error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>
        <form method="post">
            <label>Username</label>
            <input type="text" name="username" required autofocus>
            <label>Password</label>
            <input type="password" name="password" required>
            <button type="submit" class="btn">Masuk</button>
        </form>
        <p>Gunakan akun admin default <strong>admin</strong> / <strong>admin123</strong>.</p>
        <p>Jika belum diinstall, jalankan <a href="install.php">install database</a>.</p>
    </div>
</body>
</html>
