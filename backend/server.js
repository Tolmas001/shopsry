const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const { sendResetCode } = require('./mailer');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Helper to save base64 image
function saveBase64Image(base64) {
  if (!base64 || !base64.startsWith('data:image/')) return base64;
  
  try {
    const matches = base64.match(/^data:image\/([A-Za-z+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64;
    
    const extension = matches[1].split('+')[0]; // Handle svg+xml -> svg
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    const filename = `img_${Date.now()}.${extension}`;
    const filepath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Error saving image:', err);
    return base64;
  }
}

const SECRET_KEY = process.env.JWT_SECRET || 'secret';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err || user.role !== 'admin') return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', authenticateAdmin, async (req, res) => {
  const { name, description } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
      [name, description]
    );
    res.json({ id: rows[0].id, name, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', authenticateAdmin, async (req, res) => {
  const { name, description } = req.body;
  try {
    await pool.query(
      'UPDATE categories SET name = $1, description = $2 WHERE id = $3',
      [name, description, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Products with filtering and sorting
app.get('/api/products', async (req, res) => {
  const { brand, name, category, minPrice, maxPrice, sort } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  let paramCount = 1;
  
  if (brand) {
    query += ` AND brand ILIKE $${paramCount++}`;
    params.push(`%${brand}%`);
  }
  if (name) {
    query += ` AND name ILIKE $${paramCount++}`;
    params.push(`%${name}%`);
  }
  if (category) {
    query += ` AND category ILIKE $${paramCount++}`;
    params.push(`%${category}%`);
  }
  if (minPrice) {
    query += ` AND price >= $${paramCount++}`;
    params.push(minPrice);
  }
  if (maxPrice) {
    query += ` AND price <= $${paramCount++}`;
    params.push(maxPrice);
  }
  
  switch(sort) {
    case 'price_asc': query += ' ORDER BY price ASC'; break;
    case 'price_desc': query += ' ORDER BY price DESC'; break;
    case 'newest': query += ' ORDER BY created_at DESC'; break;
    default: query += ' ORDER BY created_at DESC';
  }
  
  try {
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', authenticateAdmin, async (req, res) => {
  const { name, brand, category, description, price, image, colors, sizes, stock_count } = req.body;
  const processedImage = saveBase64Image(image);
  try {
    const { rows } = await pool.query(
      'INSERT INTO products (name, brand, category, description, price, image, colors, sizes, stock_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      [name, brand, category, description, price, processedImage, JSON.stringify(colors || []), JSON.stringify(sizes || []), stock_count || 0]
    );
    res.json({ id: rows[0].id, name, brand, category, description, price, image: processedImage, colors, sizes, stock_count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', authenticateAdmin, async (req, res) => {
  const { name, brand, category, description, price, image, colors, sizes, stock_count } = req.body;
  const processedImage = saveBase64Image(image);
  try {
    await pool.query(
      'UPDATE products SET name = $1, brand = $2, category = $3, description = $4, price = $5, image = $6, colors = $7, sizes = $8, stock_count = $9 WHERE id = $10',
      [name, brand, category, description, price, processedImage, JSON.stringify(colors || []), JSON.stringify(sizes || []), stock_count, req.params.id]
    );
    res.json({ success: true, image: processedImage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like product
app.post('/api/products/:id/like', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query('SELECT likes FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    let likes = rows[0].likes || [];
    const index = likes.indexOf(userId);
    if (index > -1) {
      likes.splice(index, 1);
    } else {
      likes.push(userId);
    }
    await pool.query('UPDATE products SET likes = $1 WHERE id = $2', [JSON.stringify(likes), req.params.id]);
    res.json({ likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment
app.post('/api/products/:id/comments', authenticateToken, async (req, res) => {
  const { text, image } = req.body;
  const processedImage = saveBase64Image(image);
  try {
    const { rows } = await pool.query('SELECT comments FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    let comments = rows[0].comments || [];
    comments.push({
      username: req.user.username,
      text,
      image: processedImage || null,
      timestamp: new Date().toISOString()
    });
    await pool.query('UPDATE products SET comments = $1 WHERE id = $2', [JSON.stringify(comments), req.params.id]);
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, 
       COALESCE(json_agg(json_build_object('name', p.name, 'image', p.image, 'quantity', oi.quantity, 'price', oi.price)) FILTER (WHERE p.id IS NOT NULL), '[]') as items_list
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/admin', authenticateAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, 
       COALESCE(json_agg(json_build_object('name', p.name, 'image', p.image, 'quantity', oi.quantity, 'price', oi.price)) FILTER (WHERE p.id IS NOT NULL), '[]') as items_list
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, 
       COALESCE(json_agg(json_build_object('name', p.name, 'image', p.image, 'quantity', oi.quantity, 'price', oi.price)) FILTER (WHERE p.id IS NOT NULL), '[]') as items_list
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.id = $1 AND (o.user_id = $2 OR $3 = 'admin')
       GROUP BY o.id`,
      [req.params.id, req.user.id, req.user.role]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  const { customer_name, customer_phone, customer_address, items, payment_method } = req.body;
  const user_id = req.user.id;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const payment_status = payment_method === 'card' ? 'paid' : 'unpaid';
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'INSERT INTO orders (user_id, customer_name, customer_phone, customer_address, total_amount, payment_method, payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [user_id || null, customer_name, customer_phone, customer_address, total, payment_method || 'cash', payment_status]
    );
    const orderId = rows[0].id;
    
    // Add Loyalty Points if user is logged in
    if (user_id) {
      const pointsEarned = Math.floor(total / 10000); // 1 point per 10,000 UZS
      if (pointsEarned > 0) {
        await client.query('UPDATE users SET points = COALESCE(points, 0) + $1 WHERE id = $2', [pointsEarned, user_id]);
      }
    }
    
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.id, item.quantity, item.price]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true, order_id: orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.put('/api/orders/:id/status', authenticateAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
      [username, email, hashedPassword, 'user']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Username or email already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(404).json({ error: 'Ushbu email bilan foydalanuvchi topilmadi' });
    
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    await pool.query('UPDATE users SET reset_code = $1, reset_expiry = $2 WHERE email = $3', [code, expiry, email]);
    
    await sendResetCode(email, code);
    
    res.json({ success: true, message: 'Tasdiqlash kodi emailingizga yuborildi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    
    if (!user || user.reset_code !== code || new Date() > new Date(user.reset_expiry)) {
      return res.status(400).json({ error: 'Tasdiqlash kodi noto\'g\'ri yoki muddati o\'tgan' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1, reset_code = NULL, reset_expiry = NULL WHERE email = $2', [hashedPassword, email]);
    
    res.json({ success: true, message: 'Parol muvaffaqiyatli o\'zgartirildi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL || 'http://localhost:5001/auth/google/callback'
);

app.get('/auth/google', (req, res) => {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    prompt: 'select_account'
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, sub: google_id, picture } = payload;
    
    let { rows } = await pool.query('SELECT * FROM users WHERE google_id = $1', [google_id]);
    let user = rows[0];
    
    if (!user) {
      const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      user = emailCheck.rows[0];
      
      if (user) {
        await pool.query('UPDATE users SET google_id = $1, image = COALESCE(image, $2), full_name = COALESCE(full_name, $3) WHERE id = $4', [google_id, picture, name, user.id]);
        user.google_id = google_id;
      } else {
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
        const { rows: newUserRows } = await pool.query(
          'INSERT INTO users (username, email, google_id, image, full_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [username, email, google_id, picture, name, 'user']
        );
        user = newUserRows[0];
      }
    }
    
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    
    // Redirect back to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login-success?token=${token}`);
    
  } catch (err) {
    console.error('Google callback error:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, username, email, full_name, role, image, phone, points, notifications_enabled, privacy_private, address_list, saved_cards FROM users WHERE id = $1', [req.user.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  const { username, email, password, image, full_name, phone, notifications_enabled, privacy_private, address_list, saved_cards } = req.body;
  const userId = req.user.id;
  
  try {
    const savedImagePath = saveBase64Image(image);
    let query = 'UPDATE users SET username = $1, email = $2, image = $3, full_name = $4, phone = $5, notifications_enabled = $6, privacy_private = $7, address_list = $8, saved_cards = $9';
    const params = [
      username, 
      email, 
      savedImagePath, 
      full_name, 
      phone, 
      notifications_enabled, 
      privacy_private, 
      JSON.stringify(address_list || []), 
      JSON.stringify(saved_cards || [])
    ];
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = $10 WHERE id = $11';
      params.push(hashedPassword, userId);
    } else {
      query += ' WHERE id = $10';
      params.push(userId);
    }
    
    await pool.query(query, params);
    
    // Fetch updated user
    const { rows } = await pool.query('SELECT id, username, email, full_name, role, image, phone, points, notifications_enabled, privacy_private, address_list, saved_cards FROM users WHERE id = $1', [userId]);
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(400).json({ error: 'Username or email already exists' });
  }
});

// User reviews
app.get('/api/auth/my-reviews', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, image, comments FROM products WHERE comments @> $1', [JSON.stringify([{ username: req.user.username }])]);
    const reviews = [];
    rows.forEach(p => {
      p.comments.forEach(c => {
        if (c.username === req.user.username) {
          reviews.push({
            productId: p.id,
            productName: p.name,
            productImage: p.image,
            ...c
          });
        }
      });
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Advanced Stats
app.get('/api/stats', authenticateAdmin, async (req, res) => {
  try {
    const productsRes = await pool.query('SELECT COUNT(*) as count FROM products');
    const ordersRes = await pool.query('SELECT COUNT(*) as count FROM orders');
    const revenueRes = await pool.query('SELECT SUM(total_amount) as total FROM orders');
    const pendingRes = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = $1', ['pending']);
    
    // Revenue trend (last 6 months)
    const trendRes = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as label,
        SUM(total_amount) as val
      FROM orders
      WHERE created_at > NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `);

    // Status distribution
    const statusRes = await pool.query(`
      SELECT status as label, COUNT(*) as count
      FROM orders
      GROUP BY status
    `);
    
    res.json({
      totalProducts: parseInt(productsRes.rows[0].count),
      totalOrders: parseInt(ordersRes.rows[0].count),
      totalRevenue: parseFloat(revenueRes.rows[0].total) || 0,
      pendingOrders: parseInt(pendingRes.rows[0].count),
      revenueTrend: trendRes.rows.map(r => ({ label: r.label, val: parseFloat(r.val) })),
      statusDistribution: statusRes.rows
    });
  } catch (err) {
     res.status(500).json({ error: err.message });
  }
});

// Demo data insertion API
app.post('/api/demo/seed', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Create Admin User from .env
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedAdminPass = await bcrypt.hash(adminPass, 10);
    
    await client.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING',
      [adminUser, 'admin@shop.com', hashedAdminPass, 'admin']
    );

    // Create categories
    const categories = [
      ['Electronics', 'Gadgets and devices'],
      ['Clothing', 'Men and Women clothing'],
      ['Home', 'Everything for your home']
    ];
    for(const c of categories) {
      await client.query('INSERT INTO categories (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING', [c[0], c[1]]);
    }
    
    // Create some products
    const sampleProducts = [
      ['Smartphone X', 'TechBrand', 'Electronics', 'Latest smartphone.', 699, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
      ['Cotton T-Shirt', 'FashionCo', 'Clothing', 'Comfy shirt.', 19, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
      ['Smart Watch', 'FitLife', 'Electronics', 'Track your health.', 199, 'https://images.unsplash.com/photo-1544117518-2b476035a937?w=800']
    ];
    for(const p of sampleProducts) {
      await client.query(`INSERT INTO products (name, brand, category, description, price, image, colors, sizes, stock_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, 
        [p[0], p[1], p[2], p[3], p[4], p[5], JSON.stringify(['Black', 'White']), JSON.stringify(['M', 'L']), 50]);
    }

    client.release();
    res.json({ success: true, message: 'Seeded successfully' });
  } catch (err) {
     res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;

// Database connection health check on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('CRITICAL: Database connection failed!', err.stack);
  } else {
    console.log('PostgreSQL Connected Successfully at:', res.rows[0].now);
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 ShopSRY Backend is running!`);
  console.log(`   - Port: ${PORT}`);
  console.log(`   - Local: http://localhost:${PORT}`);
  console.log(`   - Uploads: http://localhost:${PORT}/uploads\n`);
});