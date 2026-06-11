<?php
session_start();

const DB_HOST = '127.0.0.1';
const DB_USER = 'root';
const DB_PASS = '';
const DB_NAME = 'bakery_chii';

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS);
if ($mysqli->connect_errno) {
    die('Database connection failed: ' . $mysqli->connect_error);
}
$mysqli->set_charset('utf8mb4');

function get_mysqli()
{
    global $mysqli;
    return $mysqli;
}

function db()
{
    $mysqli = get_mysqli();
    if (!$mysqli->select_db(DB_NAME)) {
        die('Database belum diinstall. Jalankan install.php');
    }
    return $mysqli;
}

function admin_check()
{
    if (empty($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        header('Location: login.php');
        exit;
    }
}

function admin_user()
{
    return $_SESSION['admin_user'] ?? null;
}
