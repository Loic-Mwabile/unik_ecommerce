require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('./db');

// Secret key for JWT
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Password validation function
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push("Le mot de passe doit contenir au moins 8 caractères");
    if (!hasUpperCase) errors.push("Le mot de passe doit contenir au moins une lettre majuscule");
    if (!hasLowerCase) errors.push("Le mot de passe doit contenir au moins une lettre minuscule");
    if (!hasNumbers) errors.push("Le mot de passe doit contenir au moins un chiffre");
    if (!hasSpecialChar) errors.push("Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)");

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
};

// User registration
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    console.log('Starting registration for:', { username, email });

    if (!username || !email || !password) {
        console.log('Missing required fields');
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        console.log('Password validation failed:', passwordValidation.errors);
        return res.status(400).json({ 
            error: 'Invalid password',
            details: passwordValidation.errors
        });
    }

    try {
        // Check if user already exists
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            console.log('User already exists:', email);
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully');

        // Insert new user
        console.log('Inserting new user...');
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
            [username, email, hashedPassword]
        );
        console.log('User created successfully:', email);
        res.status(201).json({ 
            message: 'User created successfully',
            userId: result.rows[0].id 
        });
    } catch (error) {
        console.error('Error in registration process:', error);
        res.status(500).json({ 
            error: 'Error processing request',
            details: error.message 
        });
    }
};

// User login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ error: 'User not found' });
        }

        // Compare passwords
        console.log('Comparing passwords...');
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Invalid password for:', email);
            return res.status(400).json({ error: 'Invalid password' });
        }

        // Create and send JWT token
        console.log('Creating JWT token...');
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful for:', email);
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Error in login process:', error);
        res.status(500).json({ 
            error: 'Error processing request',
            details: error.message 
        });
    }
};

module.exports = {
    authenticateToken,
    registerUser,
    loginUser
}; 