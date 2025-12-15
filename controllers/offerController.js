const { calculateOffers } = require('../services/eligibilityService');

// @desc    Calculate eligible offers based on user input
const getCalculatedOffers = (req, res) => {
    try {
        const { salary, age, employmentType, existingEmi } = req.body;

        // Validate inputs
        if (!salary || !age) {
            return res.status(400).json({ success: false, message: 'Salary and Age are required' });
        }

        const offers = calculateOffers({ salary, age, employmentType, existingEmi });

        res.status(200).json({
            success: true,
            count: offers.length,
            data: offers
        });
    } catch (error) {
        console.error('Error calculating offers:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getCalculatedOffers
};
