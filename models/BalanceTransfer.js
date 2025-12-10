const mongoose = require('mongoose');

const BalanceTransferSchema = new mongoose.Schema({
    // Basic Details
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String },

    // Existing Loan Details
    existingBankName: { type: String, required: true },
    outstandingPrincipal: { type: Number, required: true },
    currentEMI: { type: Number },
    currentInterestRate: { type: Number },
    loanType: { type: String, enum: ['Personal Loan', 'Home Loan', 'Business Loan'] },

    // Transfer Request
    topUpAmountNeeded: { type: Number, default: 0 },
    preferredTenure: { type: Number },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'in_review'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('BalanceTransfer', BalanceTransferSchema);
