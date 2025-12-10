const mongoose = require('mongoose');

const HomeLoanSchema = new mongoose.Schema({
    // Basic Applicant Details
    fullName: { type: String, required: true },
    pan: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String },
    dob: { type: Date },

    // Property Details
    propertyLocation: { type: String },
    propertyCity: { type: String },
    propertyPincode: { type: String },
    propertyValue: { type: Number },
    isPropertyIdentified: { type: Boolean, default: false },

    // Employment
    employmentType: { type: String, enum: ['Salaried', 'Self-Employed'] },
    monthlyIncome: { type: Number },

    // Loan Details
    loanAmount: { type: Number, required: true },
    tenureYears: { type: Number },

    // Co-Applicant
    coApplicant: {
        hasCoApplicant: { type: Boolean, default: false },
        name: String,
        relation: String,
        income: Number
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'in_review'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('HomeLoan', HomeLoanSchema);
