const express = require('express');
const router = express.Router();
const {
    createBalanceTransfer,
    updateBalanceTransfer,
    getBalanceTransfers,
    deleteBalanceTransfer
} = require('../controllers/balanceTransferController');

router.post('/', createBalanceTransfer);
router.put('/:id', updateBalanceTransfer);
router.get('/', getBalanceTransfers);
router.delete('/:id', deleteBalanceTransfer);

module.exports = router;
