<?php
require_once __DIR__ . '/config.php';
admin_check();

$success = '';
$error = '';

function slugify($text)
{
    $text = preg_replace('~[^\\pL\\d]+~u', '-', $text);
    $text = iconv('UTF-8', 'ASCII//TRANSLIT', $text);
    $text = preg_replace('~[^-\\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return $text ?: 'product-' . time();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'create') {
    $name = trim($_POST['name'] ?? '');
    $price = floatval($_POST['price'] ?? 0);
    $discount_price = $_POST['discount_price'] !== '' ? floatval($_POST['discount_price']) : null;
    $stock = intval($_POST['stock'] ?? 0);
    $category_id = intval($_POST['category_id'] ?? 0);
    $description = trim($_POST['description'] ?? '');
    $main_image = trim($_POST['main_image'] ?? '');
    $is_best_seller = isset($_POST['is_best_seller']) ? 1 : 0;
    $is_new = isset($_POST['is_new']) ? 1 : 0;
    $flash_sale_end = trim($_POST['flash_sale_end'] ?? null) ?: null;

    if ($name === '' || $price <= 0 || $category_id <= 0) {
        $error = 'Nama, harga, dan kategori wajib diisi.';
    } else {
        $slug = slugify($name);
        $baseSlug = $slug;
        $counter = 1;
        $check = db()->prepare('SELECT COUNT(*) AS total FROM products WHERE slug = ?');
        $check->bind_param('s', $slug);
        $check->execute();
        $count = $check->get_result()->fetch_assoc()['total'];
        while ($count > 0) {
            $slug = $baseSlug . '-' . $counter++;
            $check->bind_param('s', $slug);
            $check->execute();
            $count = $check->get_result()->fetch_assoc()['total'];
        }
        $check->close();

        $stmt = db()->prepare('INSERT INTO products (category_id, name, slug, description, price, discount_price, stock, main_image, is_best_seller, is_new, flash_sale_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->bind_param('isssddiisis', $category_id, $name, $slug, $description, $price, $discount_price, $stock, $main_image, $is_best_seller, $is_new, $flash_sale_end);
        if ($stmt->execute()) {
            $success = 'Produk berhasil dibuat.';
        } else {
            $error = 'Gagal menyimpan produk: ' . $stmt->error;
        }
        $stmt->close();
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete' && !empty($_POST['product_id'])) {
    $product_id = intval($_POST['product_id']);
    $stmt = db()->prepare('DELETE FROM products WHERE id = ?');
    $stmt->bind_param('i', $product_id);
    if ($stmt->execute()) {
        $success = 'Produk berhasil dihapus.';
    } else {
        $error = 'Gagal menghapus produk: ' . $stmt->error;
    }
    $stmt->close();
}

$categories = db()->query('SELECT id, name FROM categories ORDER BY name')->fetch_all(MYSQLI_ASSOC);
$products = db()->query('SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC')->fetch_all(MYSQLI_ASSOC);
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
            <div class="admin-actions">
                <span>Halo, <?= htmlspecialchars(admin_user()) ?></span>
                <a class="btn outline" href="logout.php">Logout</a>
            </div>
        </header>
        <?php if ($success): ?><div class="alert success"><?= htmlspecialchars($success) ?></div><?php endif; ?>
        <?php if ($error): ?><div class="alert error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
        <section class="card">
            <h2>Tambah Produk</h2>
            <form method="post">
                <input type="hidden" name="action" value="create">
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
                <input type="text" name="main_image" placeholder="https://example.com/image.jpg">
                <label>Deskripsi</label>
                <textarea name="description"></textarea>
                <label>Waktu Flash Sale</label>
                <input type="datetime-local" name="flash_sale_end">
                <div class="checkbox-row">
                    <label><input type="checkbox" name="is_best_seller"> Best Seller</label>
                    <label><input type="checkbox" name="is_new"> Produk Baru</label>
                </div>
                <button type="submit" class="btn">Simpan Produk</button>
            </form>
        </section>
        <section class="card">
            <h2>Produk</h2>
            <?php if (empty($products)): ?>
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
                            <th>Aksi</th>
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
                                <td><img class="product-thumb" src="<?= htmlspecialchars($product['main_image'] ?: 'https://via.placeholder.com/80') ?>" alt="<?= htmlspecialchars($product['name']) ?>"></td>
                                <td>
                                    <form method="post" onsubmit="return confirm('Hapus produk ini?');">
                                        <input type="hidden" name="action" value="delete">
                                        <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
                                        <button class="btn outline danger">Hapus</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </section>
    </div>
</body>
</html>
