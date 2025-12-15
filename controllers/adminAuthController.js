const AdminUser = require('../models/AdminUser');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fycred_admin_secret_key_123';

// @desc    Admin login
const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const admin = await AdminUser.findOne({ username });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Simple password check (in production use bcrypt)
        if (admin.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: admin.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ success: true, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Verify admin token
const verifyAdmin = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ success: false });

        const decoded = jwt.verify(token, JWT_SECRET);
        // Optional: check if user still exists
        const admin = await AdminUser.findById(decoded.id);
        if (!admin) return res.status(401).json({ success: false });

        res.json({ success: true, user: { username: admin.username, role: admin.role } });
    } catch (error) {
        res.status(401).json({ success: false });
    }
};

module.exports = {
    loginAdmin,
    verifyAdmin
};
