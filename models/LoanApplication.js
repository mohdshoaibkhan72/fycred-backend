const mongoose = require('mongoose');

const LoanApplicationSchema = new mongoose.Schema({
    loanType: {
        type: String,
        enum: ['personal', 'home', 'balance'],
        required: true,
    },
    applicantDetails: {
        fullName: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        email: { type: String },
        panCard: { type: String },
        dateOfBirth: { type: Date },
        gender: { type: String, enum: ['Male', 'Female', 'Other'] },
        city: { type: String },
    },
    employmentDetails: {
        employmentType: { type: String, enum: ['Salaried', 'Self-Employed'] },
        monthlyIncome: { type: Number },
        companyName: { type: String },
        workExperienceYears: { type: Number },
    },
    loanDetails: {
        amount: { type: Number, required: true },
        tenureYears: { type: Number },
        purpose: { type: String },
    },
    // Additional fields specific, e.g., for Home Loan
    propertyDetails: {
        propertyLocation: { type: String },
        propertyValue: { type: Number },
        isPropertyIdentified: { type: Boolean },
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'in_review'],
        default: 'pending',
    },
}, { timestamps: true });

module.exports = mongoose.model('LoanApplication', LoanApplicationSchema);
