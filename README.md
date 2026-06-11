# bakery-naichii

## PHP Admin Panel

Panel admin PHP tersedia di folder `phpadmin/`.

- Buka `phpadmin/install.php` untuk membuat database dan akun admin default.
- Login admin di `phpadmin/login.php`.
- Dashboard admin berada di `phpadmin/dashboard.php`.

Default admin credentials:
- username: `admin`
- password: `admin123`

Untuk menjalankan lokal dengan built-in PHP server:

```bash
cd phpadmin
php -S localhost:8000
```

Lalu buka `http://localhost:8000`.


## Admin Panel

Ada panel admin sederhana untuk menambah produk secara manual.

- Path: `admin/` (buka [admin/login.html](admin/login.html) atau [admin/](admin/))
- Credentials default: **admin** / **password123**
- Produk disimpan di LocalStorage browser dengan key `naichiiProducts`.

Untuk mencoba, jalankan server statis atau buka `index.html` di browser dan klik tautan "Admin" di navigasi.