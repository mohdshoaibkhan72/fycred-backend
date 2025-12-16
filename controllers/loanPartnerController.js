const LoanPartner = require('../models/LoanPartner');

// @desc    Get all active loan partners
// @route   GET /api/partners
// @access  Public
const getLoanPartners = async (req, res) => {
    try {
        const { loanType, includeInactive } = req.query;
        let query = {};

        if (String(includeInactive) !== 'true') {
            query.isActive = true;
        }

        if (loanType) {
            query.loanType = loanType;
        }

        const partners = await LoanPartner.find(query).sort({ order: 1 });

        res.status(200).json({
            success: true,
            count: partners.length,
            data: partners
        });
    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Create a new loan partner
// @route   POST /api/partners
// @access  Private
const createLoanPartner = async (req, res) => {
    try {
        const partner = await LoanPartner.create(req.body);
        res.status(201).json({
            success: true,
            data: partner
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update a loan partner
// @route   PUT /api/partners/:id
// @access  Private
const updateLoanPartner = async (req, res) => {
    try {
        // Find existing partner to manage order updates if necessary, or just update
        const partner = await LoanPartner.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!partner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        res.status(200).json({
            success: true,
            data: partner
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a loan partner
// @route   DELETE /api/partners/:id
// @access  Private
const deleteLoanPartner = async (req, res) => {
    try {
        const partner = await LoanPartner.findByIdAndDelete(req.params.id);

        if (!partner) {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Partner deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

module.exports = {
    getLoanPartners,
    createLoanPartner,
    updateLoanPartner,
    deleteLoanPartner
};
