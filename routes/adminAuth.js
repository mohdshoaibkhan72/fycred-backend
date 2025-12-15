const express = require('express');
const router = express.Router();
const {
    loginAdmin,
    verifyAdmin
} = require('../controllers/adminAuthController');

router.post('/login', loginAdmin);
router.get('/verify', verifyAdmin);

module.exports = router;
