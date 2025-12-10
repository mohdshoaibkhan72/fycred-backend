const mongoose = require('mongoose');

const PersonalLoanSchema = new mongoose.Schema({
    // Basic Details
    fullName: { type: String, required: true },
    pan: { type: String, required: true },
    mobile: { type: String, required: true },
    cibilScore: { type: Number },

    // Employment Details
    employmentType: { type: String, enum: ['Salaried', 'Self-Employed'] },
    employerName: { type: String },
    monthlySalary: { type: Number },
    designation: { type: String },
    doj: { type: Date },
    officeAddress: { type: String },
    officePincode: { type: String },
    officeLandmark: { type: String },

    // Loan Requirements
    amount: { type: Number, required: true },
    tenureMonths: { type: Number },
    purpose: { type: String },
    existingEmi: { type: Number, default: 0 },

    // Personal Details
    dob: { type: Date },
    aadhar: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    spouseName: { type: String },
    personalEmail: { type: String },
    officialEmail: { type: String },

    // Address
    currentAddress: { type: String },
    currentLandmark: { type: String },
    pincode: { type: String },
    residenceType: { type: String },
    permanentAddress: { type: String },
    permanentPincode: { type: String },
    permanentLandmark: { type: String },

    // Bank Details
    salaryAccountNo: { type: String },
    ifscCode: { type: String },

    // References
    reference1: {
        fullName: String,
        mobile: String,
        address: String,
        relationship: String
    },
    reference2: {
        fullName: String,
        mobile: String,
        address: String,
        relationship: String
    },

    // Documents (Cloudinary URLs)
    documents: {
        aadhaarFront: String,
        aadhaarBack: String,
        panCard: String,
        selfie: String,
        salarySlip: String,
        bankStatement: String
    },

    // Metadata
    selectedOffer: {
        bankName: String,
        interestRate: Number,
        processingFee: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'in_review'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('PersonalLoan', PersonalLoanSchema);
