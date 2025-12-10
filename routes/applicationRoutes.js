const express = require('express');
const router = express.Router();
const LoanApplication = require('../models/LoanApplication');

// @route   POST /api/applications
// @desc    Submit a new loan application (PL or HL)
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { loanType, applicantDetails, employmentDetails, loanDetails, propertyDetails } = req.body;

        const newApplication = new LoanApplication({
            loanType,
            applicantDetails,
            employmentDetails,
            loanDetails,
            propertyDetails
        });

        const savedApplication = await newApplication.save();

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: savedApplication
        });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not submit application',
            error: error.message
        });
    }
});

// @route   GET /api/applications
// @desc    Get all applications (Admin use)
// @access  Public (Should be protected in prod)
router.get('/', async (req, res) => {
    try {
        const applications = await LoanApplication.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not fetch applications'
        });
    }
});

// @route   GET /api/applications/:id
// @desc    Get single application by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const application = await LoanApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
