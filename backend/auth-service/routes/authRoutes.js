// auth-service/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Sử dụng pool.promise() từ db.js
const router = express.Router();

console.log('[authRoutes.js] Type of db object imported:', typeof db);
if (db && typeof db.query === 'function') {
    console.log('[authRoutes.js] db.query IS a function.');
} else {
    console.error('[authRoutes.js] db.query IS NOT a function. db object is:', db);
}

// POST /auth/register
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Kiểm tra email đã tồn tại chưa
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const userRole = (role && ['patient', 'doctor', 'admin'].includes(role)) ? role : 'patient';

        const [result] = await db.query(
            'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
            [email, passwordHash, userRole]
        );

        const [newUser] = await db.query('SELECT id, email, role, created_at FROM users WHERE id = ?', [result.insertId]);

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser[0],
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials (email not found)' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials (password incorrect)' });
        }

        const payload = { userId: user.id, email: user.email, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10h' });

        res.json({
            message: 'Logged in successfully',
            token,
            user: { id: user.id, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;