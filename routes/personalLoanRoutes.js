const express = require('express');
const router = express.Router();
const PersonalLoan = require('../models/PersonalLoan');

const { generateApplicationId } = require('../utils/generateId');

// @route   POST /api/personal-loan
// @desc    Submit a Personal Loan application
router.post('/', async (req, res) => {
    try {
        const applicationId = generateApplicationId('PL');
        const application = new PersonalLoan({ ...req.body, applicationId });
        const savedApplication = await application.save();
        res.status(201).json({
            success: true,
            message: 'Personal Loan Application submitted successfully',
            data: savedApplication
        });
    } catch (error) {
        console.error('Error submitting PL:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not submit application',
            error: error.message
        });
    }
});

// @route   PUT /api/personal-loan/:id
// @desc    Update an existing Personal Loan application
router.put('/:id', async (req, res) => {
    try {
        const application = await PersonalLoan.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: false } // runValidators: false allows partial updates without strict checking of all required fields if they are missing
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Personal Loan Application updated successfully',
            data: application
        });
    } catch (error) {
        console.error('Error updating PL:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not update application',
            error: error.message
        });
    }
});

// @route   GET /api/personal-loan
// @desc    Get all PL applications
router.get('/', async (req, res) => {
    try {
        const applications = await PersonalLoan.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   DELETE /api/personal-loan/:id
// @desc    Delete a Personal Loan application
router.delete('/:id', async (req, res) => {
    try {
        const application = await PersonalLoan.findByIdAndDelete(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Personal Loan Application deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting PL:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not delete application',
            error: error.message
        });
    }
});

module.exports = router;
