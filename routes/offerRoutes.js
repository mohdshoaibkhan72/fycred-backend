const express = require('express');
const router = express.Router();
const { getCalculatedOffers } = require('../controllers/offerController');

router.post('/calculate', getCalculatedOffers);

module.exports = router;
