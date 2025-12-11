const crypto = require('crypto');

/**
 * Generates a unique application ID.
 * Format: FYC-{PREFIX}-{YYYYMMDD}-{RANDOM}
 * Example: FYC-PL-20231211-A1B2
 * @param {string} prefix - The prefix for the loan type (e.g., 'PL', 'HL', 'BT')
 * @returns {string} The generated Application ID
 */
const generateApplicationId = (prefix) => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `FYC-${prefix}-${date}-${random}`;
};

module.exports = { generateApplicationId };
