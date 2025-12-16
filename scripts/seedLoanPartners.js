const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const LoanPartner = require('../models/LoanPartner');

// Verify path to .env
const envPath = path.join(__dirname, '../.env');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is undefined in .env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    }
};

const seedPartners = async () => {
    await connectDB();

    const partners = [
        // --- PERSONAL LOAN ---
        {
            name: 'HDFC Bank',
            logo: 'https://s7ap1.scene7.com/is/content/hdfcbankPWS/hdfc-bank-logo?fmt=webp',
            interestRate: 10.25,
            maxAmount: 4000000,
            processingFee: '0.99%',
            features: ['Pre-approved', 'Instant Credit'],
            color: 'bg-[#004C8F]',
            loanType: 'personal',
            order: 1
        },
        {
            name: 'ICICI Bank',
            logo: 'https://www.icici.bank.in/content/dam/icicibank-revamp/images/icici-logo/icici-header-logo.png',
            interestRate: 10.49,
            maxAmount: 5000000,
            processingFee: '₹999',
            features: ['30 Min Disbursal', 'Flexible Tenure'],
            color: 'bg-[#F37E20]',
            loanType: 'personal',
            order: 2
        },
        {
            name: 'IDFC First Bank',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Logo_of_IDFC_First_Bank.svg/2560px-Logo_of_IDFC_First_Bank.svg.png',
            interestRate: 10.75,
            maxAmount: 1500000,
            processingFee: 'Zero',
            features: ['Paperless', 'Digital KYC'],
            color: 'bg-[#9D1D27]',
            loanType: 'personal',
            order: 3
        },

        // --- HOME LOAN ---
        {
            name: 'SBI Home',
            logo: 'https://chaitanyainvestment.com/wp-content/uploads/2022/10/SBI-Home-Loan-Logo-Vector.png',
            interestRate: 8.35,
            maxAmount: 100000000,
            processingFee: 'Zero',
            features: ['No Hidden Charges', 'Top-up Available'],
            color: 'bg-[#2F5F9E]',
            loanType: 'home',
            order: 1
        },
        {
            name: 'LIC Housing',
            logo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/LIC_Housing_Finance_logo.png',
            interestRate: 8.50,
            maxAmount: 50000000,
            processingFee: '₹5000',
            features: ['30 Year Tenure', 'Low EMI'],
            color: 'bg-[#FFC72C]',
            loanType: 'home',
            order: 2
        },
        {
            name: 'HDFC Home',
            logo: 'https://s7ap1.scene7.com/is/content/hdfcbankPWS/hdfc-bank-logo?fmt=webp',
            interestRate: 8.45,
            maxAmount: 75000000,
            processingFee: '0.5%',
            features: ['Doorstep Service', 'Quick Approval'],
            color: 'bg-[#004C8F]',
            loanType: 'home',
            order: 3
        },

        // --- BALANCE TRANSFER ---
        {
            name: 'HDFC Transfer',
            logo: 'https://s7ap1.scene7.com/is/content/hdfcbankPWS/hdfc-bank-logo?fmt=webp',
            interestRate: 8.60,
            maxAmount: 50000000,
            processingFee: 'Zero',
            features: ['Top-up Loan', 'Quick Transfer'],
            color: 'bg-[#004C8F]',
            loanType: 'balance',
            order: 1
        },
        {
            name: 'Kotak Bank',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Kotak_Mahindra_Bank_logo.svg/2560px-Kotak_Mahindra_Bank_logo.svg.png',
            interestRate: 8.70,
            maxAmount: 40000000,
            processingFee: '₹2000',
            features: ['Zero Foreclosure', 'Low ROI'],
            color: 'bg-[#DA251D]',
            loanType: 'balance',
            order: 2
        },
        {
            name: 'Axis Finance',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/AXISBank_Logo.svg/1200px-AXISBank_Logo.svg.png',
            interestRate: 8.75,
            maxAmount: 30000000,
            processingFee: '0.25%',
            features: ['Minimal Docs', 'Doorstep'],
            color: 'bg-[#97144D]',
            loanType: 'balance',
            order: 3
        }
    ];

    try {
        // Clear existing partners
        await LoanPartner.deleteMany({});
        console.log('Cleared existing partners');

        // Insert new partners
        await LoanPartner.insertMany(partners);
        console.log('Seeded Loan Partners successfully!');

        process.exit();
    } catch (error) {
        console.error('Error seeding partners:', error);
        process.exit(1);
    }
};

seedPartners();
