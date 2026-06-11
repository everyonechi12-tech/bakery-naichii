<?php
session_start();

// Database configuration
const DB_HOST = '127.0.0.1';
const DB_USER = 'root';
const DB_PASS = '';
const DB_NAME = 'bakery_chii';

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS);
if ($mysqli->connect_errno) {
    die('Database connection failed: ' . $mysqli->connect_error);
}
$mysqli->set_charset('utf8mb4');
if (!$mysqli->select_db(DB_NAME)) {
    // Database may not exist yet during installation.
}

function db()
{
    global $mysqli;
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
