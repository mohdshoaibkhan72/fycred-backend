const express = require('express');
const router = express.Router();
const { getLoanPartners, createLoanPartner, updateLoanPartner, deleteLoanPartner } = require('../controllers/loanPartnerController');

router.get('/', getLoanPartners);
router.post('/', createLoanPartner);
router.put('/:id', updateLoanPartner);
router.delete('/:id', deleteLoanPartner);

module.exports = router;
