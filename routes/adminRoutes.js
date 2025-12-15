const express = require('express');
const router = express.Router();
const {
    getOverviewStats,
    getDisbursementStats
} = require('../controllers/adminController');

router.get('/overview', getOverviewStats);
router.get('/disbursements', getDisbursementStats);

module.exports = router;
