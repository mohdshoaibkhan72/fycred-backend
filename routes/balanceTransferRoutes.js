const express = require('express');
const router = express.Router();
const BalanceTransfer = require('../models/BalanceTransfer');

const { generateApplicationId } = require('../utils/generateId');

// @route   POST /api/balance-transfer
// @desc    Submit a Balance Transfer application
router.post('/', async (req, res) => {
    try {
        const applicationId = generateApplicationId('BT');
        const application = new BalanceTransfer({ ...req.body, applicationId });
        const savedApplication = await application.save();
        res.status(201).json({
            success: true,
            message: 'Balance Transfer Application submitted successfully',
            data: savedApplication
        });
    } catch (error) {
        console.error('Error submitting BT:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not submit application',
            error: error.message
        });
    }
});

// @route   GET /api/balance-transfer
// @desc    Get all BT applications
router.get('/', async (req, res) => {
    try {
        const applications = await BalanceTransfer.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   DELETE /api/balance-transfer/:id
// @desc    Delete a Balance Transfer application
router.delete('/:id', async (req, res) => {
    try {
        const application = await BalanceTransfer.findByIdAndDelete(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Balance Transfer Application deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting BT:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not delete application',
            error: error.message
        });
    }
});

module.exports = router;
