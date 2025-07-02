const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const { authenticateToken, registerUser, loginUser } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Request body:', req.body);
    next();
});

// API Routes - Must be defined BEFORE static file serving
// Authentication routes
app.post('/api/auth/register', (req, res) => {
    console.log('Registration attempt received:', req.body);
    registerUser(req, res);
});

app.post('/api/auth/login', (req, res) => {
    console.log('Login attempt received:', req.body);
    loginUser(req, res);
});

// Protected routes
app.get('/api/user/profile', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Product routes
app.get('/api/products', (req, res) => {
    console.log('Fetching products from database...');
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        console.log('Products found:', rows);
        res.json(rows);
    });
});

app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row);
    });
});

// Protected cart operations
app.post('/api/cart', authenticateToken, (req, res) => {
    const { productId, quantity } = req.body;
    res.json({ message: 'Cart updated successfully' });
});

// Protected checkout
app.post('/api/checkout', authenticateToken, (req, res) => {
    const { name, phone, email, address, payment_method, items, total } = req.body;
    // You can add validation or saving logic here if needed
    res.json({ success: true, message: 'Order placed successfully' });
});

// Static file serving - Must be AFTER API routes
app.use(express.static(path.join(__dirname)));

// HTML routes - Must be AFTER API routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'products.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'cart.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'checkout.html'));
});

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.html'));
});

// Database connection
const dbPath = process.env.SQLITE_PATH || './ecommerce.db';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database at', dbPath);
    }
});

// Create users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) {
        console.error('Error creating users table:', err);
    } else {
        console.log('Users table created or already exists');
    }
});

// Create products table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) {
        console.error('Error creating products table:', err);
    } else {
        console.log('Products table created or already exists');
        // Insert some sample products if the table is empty
        db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
            if (err) {
                console.error('Error checking products count:', err);
                return;
            }
            if (row.count === 0) {
                const sampleProducts = [
                    ['Product 1', 'Description for product 1', 19.99, 'assets/placeholder.jpg'],
                    ['Product 2', 'Description for product 2', 29.99, 'assets/placeholder.jpg'],
                    ['Product 3', 'Description for product 3', 39.99, 'assets/placeholder.jpg']
                ];
                const stmt = db.prepare('INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)');
                sampleProducts.forEach(product => {
                    stmt.run(product);
                });
                stmt.finalize();
                console.log('Sample products inserted');
            }
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
