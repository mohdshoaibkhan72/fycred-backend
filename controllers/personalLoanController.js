const PersonalLoan = require('../models/PersonalLoan');
const { generateApplicationId } = require('../utils/generateId');

// @desc    Submit a Personal Loan application
const createPersonalLoan = async (req, res) => {
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
};

// @desc    Update an existing Personal Loan application
const updatePersonalLoan = async (req, res) => {
    try {
        const application = await PersonalLoan.findByIdAndUpdate(
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
};

// @desc    Get all PL applications
const getPersonalLoans = async (req, res) => {
    try {
        const applications = await PersonalLoan.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a Personal Loan application
const deletePersonalLoan = async (req, res) => {
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
};

module.exports = {
    createPersonalLoan,
    updatePersonalLoan,
    getPersonalLoans,
    deletePersonalLoan
};
