const express = require('express');
const router = express.Router();
const PersonalLoan = require('../models/PersonalLoan');
const HomeLoan = require('../models/HomeLoan');
const BalanceTransfer = require('../models/BalanceTransfer');

// @route   POST /api/status/check
// @desc    Check application status by App ID and DOB
router.post('/check', async (req, res) => {
    const { applicationId, dob } = req.body;

    if (!applicationId || !dob) {
        return res.status(400).json({ success: false, message: 'Application ID and Date of Birth are required' });
    }

    try {
        let application = null;
        let type = '';

        // Check if applicationId indicates type to optimize search
        if (applicationId.startsWith('FYC-PL')) {
            application = await PersonalLoan.findOne({ applicationId });
            type = 'Personal Loan';
        } else if (applicationId.startsWith('FYC-HL')) {
            application = await HomeLoan.findOne({ applicationId });
            type = 'Home Loan';
        } else if (applicationId.startsWith('FYC-BT')) {
            application = await BalanceTransfer.findOne({ applicationId });
            type = 'Balance Transfer';
        } else {
            // Fallback search all if format doesn't match standard
            application = await PersonalLoan.findOne({ applicationId });
            type = 'Personal Loan';
            if (!application) {
                application = await HomeLoan.findOne({ applicationId });
                type = 'Home Loan';
            }
            if (!application) {
                application = await BalanceTransfer.findOne({ applicationId });
                type = 'Balance Transfer';
            }
        }

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Validate DOB
        const dbDob = new Date(application.dob);
        const inputDob = new Date(dob);

        // Check if dates are valid
        if (isNaN(dbDob.getTime()) || isNaN(inputDob.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid Date Format' });
        }

        const isMatch = dbDob.toISOString().split('T')[0] === inputDob.toISOString().split('T')[0];

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Date of Birth does not match our records' });
        }

        res.status(200).json({
            success: true,
            data: {
                applicationId: application.applicationId,
                status: application.status,
                fullName: application.fullName,
                loanType: type,
                createdAt: application.createdAt,
                amount: application.amount || application.loanAmount || application.outstandingPrincipal,
                details: application
            }
        });

    } catch (error) {
        console.error('Error checking status:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

module.exports = router;
