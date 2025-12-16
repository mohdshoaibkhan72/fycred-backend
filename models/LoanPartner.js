const mongoose = require('mongoose');

const LoanPartnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    logo: { type: String, required: true },
    interestRate: { type: Number, required: true }, // Display interest rate
    maxAmount: { type: Number, required: true },
    processingFee: { type: String, default: 'Zero' },
    features: [String],
    color: { type: String, default: 'bg-[#004C8F]' },
    loanType: {
        type: String,
        enum: ['personal', 'home', 'balance'],
        required: true,
        index: true
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('LoanPartner', LoanPartnerSchema);
