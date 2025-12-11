const mongoose = require('mongoose');

const BankPolicySchema = new mongoose.Schema({
    bankId: { type: String, required: true, unique: true }, // e.g., 'HDFC', 'ICICI'
    name: { type: String, required: true },
    productType: { type: String, default: 'PL' },
    customerTypes: [{ type: String, enum: ['salaried', 'self-employed'] }],

    basic: {
        minNetSalary: { type: Number, required: true },
        minAge: { type: Number, required: true },
        maxAge: { type: Number, required: true },
        minLoanAmount: { type: Number, required: true },
        maxLoanAmount: { type: Number, required: true },
        minTenureMonths: { type: Number, required: true },
        maxTenureMonths: { type: Number, required: true }
    },

    employment: {
        minCurrentJobMonths: { type: Number, default: 0 },
        minTotalExpMonths: { type: Number, default: 0 },
        allowedCompanyCategories: [String], // ['Super A', 'Cat A', etc.]
        mcaRequired: { type: Boolean, default: false }
    },

    credit: {
        minCibil: { type: Number }, // Can be null if allowCibil0To1 handles new/low
        allowCibil0To1: { type: Boolean, default: false },
        foirRules: [{
            incomeMin: Number,
            incomeMax: Number,
            foirPercent: Number
        }],
        multiplierRules: [{
            incomeMin: Number,
            incomeMax: Number,
            category: String,
            tenure: Number, // Tenure in months (e.g. 12, 24, 36, 48, 60)
            multiplier: Number
        }]
    },

    residence: {
        bachelorAllowed: { type: Boolean, default: true },
        hostelAllowed: { type: Boolean, default: false },
        ownHouseMandatory: { type: Boolean, default: false }
    },

    flags: {
        allowsSelfEmployed: { type: Boolean, default: false },
        allowsPensioner: { type: Boolean, default: false },
        notes: [String]
    }
}, { timestamps: true });

module.exports = mongoose.model('BankPolicy', BankPolicySchema);
