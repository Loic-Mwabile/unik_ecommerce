const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./ecommerce.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('Connected to SQLite database');
});

// Create users table
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

// Create products table
db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) {
        console.error('Error creating products table:', err);
    } else {
        console.log('Products table created or already exists');
    }
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err);
    } else {
        console.log('Database connection closed');
    }
}); 