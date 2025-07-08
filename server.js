require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { authenticateToken, registerUser, loginUser } = require('./auth');
const pool = require('./db');

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
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
            console.error('Database error:', err);
        res.status(500).json({ error: err.message, details: err });
        }
});

app.get('/api/products/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        res.json(result.rows[0]);
    } catch (err) {
            res.status(500).json({ error: err.message });
        }
});

// Protected cart operations
app.post('/api/cart', authenticateToken, (req, res) => {
    // This endpoint is a placeholder; cart is managed client-side
    res.json({ message: 'Cart updated successfully' });
});

// Protected checkout
app.post('/api/checkout', authenticateToken, async (req, res) => {
    const { name, phone, email, address, payment_method, items, total } = req.body;
    try {
        await pool.query(
            'INSERT INTO orders (name, phone, email, address, payment_method, items, total) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [name, phone, email, address, payment_method, JSON.stringify(items), total]
        );
        res.json({ success: true, message: 'Order placed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
