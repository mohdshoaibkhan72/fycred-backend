const express = require('express');
const router = express.Router();
const HomeLoan = require('../models/HomeLoan');

const { generateApplicationId } = require('../utils/generateId');

// @route   POST /api/home-loan
// @desc    Submit a Home Loan application
router.post('/', async (req, res) => {
    try {
        const applicationId = generateApplicationId('HL');
        const application = new HomeLoan({ ...req.body, applicationId });
        const savedApplication = await application.save();
        res.status(201).json({
            success: true,
            message: 'Home Loan Application submitted successfully',
            data: savedApplication
        });
    } catch (error) {
        console.error('Error submitting HL:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not submit application',
            error: error.message
        });
    }
});

// @route   PUT /api/home-loan/:id
// @desc    Update an existing Home Loan application
router.put('/:id', async (req, res) => {
    try {
        const application = await HomeLoan.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: false }
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Home Loan Application updated successfully',
            data: application
        });
    } catch (error) {
        console.error('Error updating HL:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not update application',
            error: error.message
        });
    }
});

// @route   GET /api/home-loan
// @desc    Get all HL applications
router.get('/', async (req, res) => {
    try {
        const applications = await HomeLoan.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   DELETE /api/home-loan/:id
// @desc    Delete a Home Loan application
router.delete('/:id', async (req, res) => {
    try {
        const application = await HomeLoan.findByIdAndDelete(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Home Loan Application deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting HL:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not delete application',
            error: error.message
        });
    }
});

module.exports = router;
