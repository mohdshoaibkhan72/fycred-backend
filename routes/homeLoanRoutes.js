const express = require('express');
const router = express.Router();
const {
    createHomeLoan,
    updateHomeLoan,
    getHomeLoans,
    deleteHomeLoan
} = require('../controllers/homeLoanController');

router.post('/', createHomeLoan);
router.put('/:id', updateHomeLoan);
router.get('/', getHomeLoans);
router.delete('/:id', deleteHomeLoan);

module.exports = router;
