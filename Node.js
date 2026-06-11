// server.js - Backend API
const express = require('express')
const mysql = require('mysql2/promise')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const multer = require('multer')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// Database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bakery_chii',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) return res.sendStatus(401)
  
  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

// File upload configuration
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({ storage })

// ============ PRODUCTS API ============
// Get all products with filters
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 20 } = req.query
    let query = `
      SELECT p.*, c.name as category_name,
        (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as rating,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as reviews_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `
    const params = []
    
    if (category) {
      query += ' AND p.category_id = ?'
      params.push(category)
    }
    
    if (search) {
      query += ' AND p.name LIKE ?'
      params.push(`%${search}%`)
    }
    
    if (sort === 'price_asc') query += ' ORDER BY p.price ASC'
    else if (sort === 'price_desc') query += ' ORDER BY p.price DESC'
    else if (sort === 'best_seller') query += ' ORDER BY p.sold_count DESC'
    else if (sort === 'newest') query += ' ORDER BY p.created_at DESC'
    else query += ' ORDER BY p.created_at DESC'
    
    const offset = (page - 1) * limit
    query += ' LIMIT ? OFFSET ?'
    params.push(parseInt(limit), parseInt(offset))
    
    const [products] = await pool.query(query, params)
    const [total] = await pool.query('SELECT COUNT(*) as count FROM products')
    
    res.json({
      products,
      total: total[0].count,
      page: parseInt(page),
      totalPages: Math.ceil(total[0].count / limit)
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single product with variants and images
app.get('/api/products/:id', async (req, res) => {
  try {
    const [product] = await pool.query(
      `SELECT p.*, AVG(r.rating) as rating, COUNT(r.id) as reviews_count
       FROM products p
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [req.params.id]
    )
    
    const [images] = await pool.query(
      'SELECT * FROM product_images WHERE product_id = ?',
      [req.params.id]
    )
    
    const [variants] = await pool.query(
      'SELECT * FROM product_variants WHERE product_id = ?',
      [req.params.id]
    )
    
    const [reviews] = await pool.query(
      `SELECT r.*, u.username, u.avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.id]
    )
    
    res.json({
      ...product[0],
      images,
      variants,
      reviews
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create product (Admin only)
app.post('/api/admin/products', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }
    
    const {
      name, description, price, discount_price, stock,
      category_id, is_best_seller, is_new
    } = req.body
    
    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, discount_price, stock, 
        category_id, is_best_seller, is_new, main_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, discount_price, stock, 
       category_id, is_best_seller || 0, is_new || 0, req.files[0]?.filename]
    )
    
    // Save additional images
    for (let i = 1; i < req.files.length; i++) {
      await pool.query(
        'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
        [result.insertId, req.files[i].filename]
      )
    }
    
    res.json({ success: true, productId: result.insertId })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ============ CART & ORDERS API ============
// Add to cart
app.post('/api/cart/add', authenticateToken, async (req, res) => {
  try {
    const { product_id, variant_id, quantity } = req.body
    
    // Check if item already in cart
    const [existing] = await pool.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND variant_id = ?',
      [req.user.id, product_id, variant_id]
    )
    
    if (existing.length > 0) {
      await pool.query(
        'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing[0].id]
      )
    } else {
      await pool.query(
        'INSERT INTO cart (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
        [req.user.id, product_id, variant_id, quantity]
      )
    }
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get cart
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const [cart] = await pool.query(
      `SELECT c.*, p.name, p.price, p.discount_price, p.main_image,
              pv.variant_name, pv.variant_value, pv.price_adjustment
       FROM cart c
       JOIN products p ON c.product_id = p.id
       LEFT JOIN product_variants pv ON c.variant_id = pv.id
       WHERE c.user_id = ?`,
      [req.user.id]
    )
    
    let subtotal = 0
    cart.forEach(item => {
      const price = item.discount_price || item.price
      const variantPrice = item.price_adjustment || 0
      item.total_price = (price + variantPrice) * item.quantity
      subtotal += item.total_price
    })
    
    res.json({ cart, subtotal })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create order
app.post('/api/orders', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection()
  await connection.beginTransaction()
  
  try {
    const { shipping_address, shipping_courier, payment_method, voucher_code } = req.body
    
    // Get cart items
    const [cart] = await connection.query(
      `SELECT c.*, p.price, p.discount_price, pv.price_adjustment
       FROM cart c
       JOIN products p ON c.product_id = p.id
       LEFT JOIN product_variants pv ON c.variant_id = pv.id
       WHERE c.user_id = ?`,
      [req.user.id]
    )
    
    if (cart.length === 0) {
      throw new Error('Cart is empty')
    }
    
    let subtotal = 0
    cart.forEach(item => {
      const price = item.discount_price || item.price
      const variantPrice = item.price_adjustment || 0
      subtotal += (price + variantPrice) * item.quantity
    })
    
    const shipping_cost = 15000 // Fixed shipping cost
    let discount_amount = 0
    
    // Apply voucher if exists
    if (voucher_code) {
      const [voucher] = await connection.query(
        'SELECT * FROM promos WHERE code = ? AND valid_from <= NOW() AND valid_until >= NOW() AND used_count < usage_limit',
        [voucher_code]
      )
      
      if (voucher.length > 0) {
        if (voucher[0].discount_type === 'percentage') {
          discount_amount = Math.min(
            (subtotal * voucher[0].discount_value / 100),
            voucher[0].max_discount
          )
        } else {
          discount_amount = voucher[0].discount_value
        }
        
        await connection.query(
          'UPDATE promos SET used_count = used_count + 1 WHERE id = ?',
          [voucher[0].id]
        )
      }
    }
    
    const grand_total = subtotal + shipping_cost - discount_amount
    const order_number = 'CHI' + Date.now()
    
    // Create order
    const [order] = await connection.query(
      `INSERT INTO orders (user_id, order_number, total_amount, shipping_cost, 
        discount_amount, grand_total, shipping_address, shipping_courier, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, order_number, subtotal, shipping_cost, discount_amount,
       grand_total, shipping_address, shipping_courier, payment_method]
    )
    
    // Create order details
    for (const item of cart) {
      await connection.query(
        `INSERT INTO order_details (order_id, product_id, variant_id, quantity, price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [order.insertId, item.product_id, item.variant_id, item.quantity,
         item.price, (item.price + (item.price_adjustment || 0)) * item.quantity]
      )
      
      // Reduce product stock
      if (item.variant_id) {
        await connection.query(
          'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.variant_id]
        )
      } else {
        await connection.query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        )
      }
    }
    
    // Clear cart
    await connection.query('DELETE FROM cart WHERE user_id = ?', [req.user.id])
    
    await connection.commit()
    res.json({ success: true, order_number })
  } catch (error) {
    await connection.rollback()
    res.status(500).json({ error: error.message })
  } finally {
    connection.release()
  }
})

// ============ AUTH API ============
// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, full_name, phone } = req.body
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, full_name, phone) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name, phone]
    )
    
    res.json({ success: true, userId: result.insertId })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const validPassword = await bcrypt.compare(password, users[0].password)
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const token = jwt.sign(
      { id: users[0].id, username: users[0].username, role: users[0].role },
      'your-secret-key',
      { expiresIn: '7d' }
    )
    
    res.json({
      success: true,
      token,
      user: {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
        role: users[0].role
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ============ STATISTICS API (Admin) ============
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }
    
    const [totalProducts] = await pool.query('SELECT COUNT(*) as count FROM products')
    const [totalOrders] = await pool.query('SELECT COUNT(*) as count FROM orders')
    const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "user"')
    const [totalRevenue] = await pool.query('SELECT SUM(grand_total) as total FROM orders WHERE payment_status = "paid"')
    
    res.json({
      totalProducts: totalProducts[0].count,
      totalOrders: totalOrders[0].count,
      totalUsers: totalUsers[0].count,
      totalRevenue: totalRevenue[0].total || 0
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(5000, () => {
  console.log('Server running on port 5000')
})