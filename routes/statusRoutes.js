const express = require('express');
const router = express.Router();
const { checkApplicationStatus } = require('../controllers/statusController');

router.post('/check', checkApplicationStatus);

module.exports = router;
