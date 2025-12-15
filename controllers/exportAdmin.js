const {
    getOverviewStats,
    getDisbursementStats
} = require('./adminController');

const {
    getPolicies,
    addPolicy,
    deletePolicy,
    updatePolicy
} = require('./eligibilityController');

module.exports = {
    getOverviewStats,
    getDisbursementStats,
    getPolicies,
    addPolicy,
    deletePolicy,
    updatePolicy
};
