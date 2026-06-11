<?php
require_once __DIR__ . '/config.php';
admin_check();

$success = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $price = floatval($_POST['price'] ?? 0);
    $description = trim($_POST['description'] ?? '');
    $image = trim($_POST['image'] ?? '');
    $category_id = intval($_POST['category_id'] ?? 0);
    $stock = intval($_POST['stock'] ?? 0);
    $is_best_seller = isset($_POST['is_best_seller']) ? 1 : 0;
    $is_new = isset($_POST['is_new']) ? 1 : 0;
    $flash_sale_end = trim($_POST['flash_sale_end'] ?? null);

    if ($name === '' || $price <= 0) {
        $error = 'Nama dan harga wajib diisi.';
    } else {
        $stmt = db()->prepare(
            'INSERT INTO products (name, description, price, discount_price, stock, category_id, main_image, is_best_seller, is_new, flash_sale_end)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $discount_price = $_POST['discount_price'] !== '' ? floatval($_POST['discount_price']) : null;
        $flash_sale_end = $flash_sale_end ?: null;
        $stmt->bind_param('ssddiisiis', $name, $description, $price, $discount_price, $stock, $category_id, $image, $is_best_seller, $is_new, $flash_sale_end);
        if ($stmt->execute()) {
            $success = 'Produk berhasil ditambahkan.';
        } else {
            $error = 'Gagal menyimpan produk: ' . $stmt->error;
        }
        $stmt->close();
    }
}

$categories = db()->query('SELECT id, name FROM categories')->fetch_all(MYSQLI_ASSOC);
$products = db()->query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC')->fetch_all(MYSQLI_ASSOC);
?>
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dashboard Admin - Bakery Naichii</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="admin-wrap">
        <header class="admin-header">
            <h1>Dashboard Admin</h1>
            <div>
                <span>Halo, <?= htmlspecialchars(admin_user()) ?></span>
                <a class="btn outline" href="logout.php">Logout</a>
            </div>
        </header>
        <?php if ($success): ?><div class="alert success"><?= htmlspecialchars($success) ?></div><?php endif; ?>
        <?php if ($error): ?><div class="alert error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
        <section class="card">
            <h2>Tambah Produk</h2>
            <form method="post">
                <label>Nama Produk</label>
                <input type="text" name="name" required>
                <label>Harga</label>
                <input type="number" step="0.01" name="price" required>
                <label>Harga Diskon</label>
                <input type="number" step="0.01" name="discount_price">
                <label>Stok</label>
                <input type="number" name="stock" value="0">
                <label>Kategori</label>
                <select name="category_id" required>
                    <option value="">Pilih kategori</option>
                    <?php foreach ($categories as $category): ?>
                        <option value="<?= $category['id'] ?>"><?= htmlspecialchars($category['name']) ?></option>
                    <?php endforeach; ?>
                </select>
                <label>URL Gambar</label>
                <input type="text" name="image" placeholder="https://example.com/image.jpg">
                <label>Deskripsi</label>
                <textarea name="description"></textarea>
                <label>Tanggal Flash Sale</label>
                <input type="datetime-local" name="flash_sale_end">
                <div class="checkbox-row">
                    <label><input type="checkbox" name="is_best_seller"> Best Seller</label>
                    <label><input type="checkbox" name="is_new"> Produk Baru</label>
                </div>
                <button type="submit" class="btn">Tambah Produk</button>
            </form>
        </section>
        <section class="card">
            <h2>Daftar Produk</h2>
            <div id="product-list">
                <?php if (count($products) === 0): ?>
                    <p>Belum ada produk.</p>
                <?php else: ?>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nama</th>
                                <th>Kategori</th>
                                <th>Harga</th>
                                <th>Stok</th>
                                <th>Gambar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($products as $product): ?>
                                <tr>
                                    <td><?= $product['id'] ?></td>
                                    <td><?= htmlspecialchars($product['name']) ?></td>
                                    <td><?= htmlspecialchars($product['category_name'] ?? '-') ?></td>
                                    <td>Rp <?= number_format($product['price'], 0, ',', '.') ?></td>
                                    <td><?= $product['stock'] ?></td>
                                    <td><img class="product-thumb" src="<?= htmlspecialchars($product['main_image'] ?: 'https://via.placeholder.com/80') ?>" alt=""></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>
        </section>
    </div>
</body>
</html>
