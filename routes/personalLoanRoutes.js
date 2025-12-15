const express = require('express');
const router = express.Router();
const {
    createPersonalLoan,
    updatePersonalLoan,
    getPersonalLoans,
    deletePersonalLoan
} = require('../controllers/personalLoanController');

router.post('/', createPersonalLoan);
router.put('/:id', updatePersonalLoan);
router.get('/', getPersonalLoans);
router.delete('/:id', deletePersonalLoan);

module.exports = router;
