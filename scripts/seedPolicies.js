const mongoose = require('mongoose');
const dotenv = require('dotenv');
const BankPolicy = require('../models/BankPolicy');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const generateMultipliers = () => {
    // Income Brackets: [0-25k, 25-35k, 35-50k, 50-75k, 75k+]
    const ranges = [
        { min: 0, max: 25000 },
        { min: 25001, max: 35000 },
        { min: 35001, max: 50000 },
        { min: 50001, max: 75000 },
        { min: 75001, max: 99999999 } // > 75k
    ];

    // Data format: [SuperA_Mult, CatA_Mult]
    const tableData = {
        12: [[5, 5], [5, 5], [6, 6], [7, 7], [7, 7]],
        24: [[9, 7], [10, 10], [10, 10], [13, 13], [13, 13]],
        36: [[12, 9], [14, 14], [16, 16], [18, 18], [18, 18]],
        48: [[14, 11], [16, 16], [20, 20], [23, 21], [23, 22]],
        60: [[15, 0], [19, 19], [22, 22], [25, 23], [27, 24]] // 60m < 25k has 15/NA -> CatA NA? Using 0.
    };

    const rules = [];

    Object.entries(tableData).forEach(([tenure, row]) => {
        row.forEach((mults, colIndex) => {
            const range = ranges[colIndex];

            // Super A Rule
            if (mults[0] > 0) {
                rules.push({
                    incomeMin: range.min,
                    incomeMax: range.max,
                    category: 'Super A',
                    tenure: Number(tenure),
                    multiplier: mults[0]
                });
            }

            // Cat A Rule
            if (mults[1] > 0) {
                rules.push({
                    incomeMin: range.min,
                    incomeMax: range.max,
                    category: 'Cat A',
                    tenure: Number(tenure),
                    multiplier: mults[1]
                });
            }
        });
    });

    return rules;
};

const policies = [
    {
        bankId: 'HDFC',
        name: 'HDFC Bank',
        productType: 'PL',
        customerTypes: ['salaried'],
        basic: {
            minNetSalary: 25000, // Super A / Cat A min
            minAge: 22,
            maxAge: 61, // "61 yrs (as per govt law)"
            minLoanAmount: 50000, // 0.5 lakh
            maxLoanAmount: 10000000, // 1 Cr
            minTenureMonths: 12,
            maxTenureMonths: 72 // "Max 72 months (84 for top 6)" - using standard 72
        },
        employment: {
            minCurrentJobMonths: 1,
            minTotalExpMonths: 12,
            allowedCompanyCategories: ['Super A', 'Cat A', 'Govt'], // Focused on what we have multipliers for
            mcaRequired: true // "Only Listed companies"
        },
        credit: {
            minCibil: 700, // Default sane value, policy says "CIBIL (0 / -1) : Yes" but doesn't specify min score for experienced. Using 700.
            allowCibil0To1: true,
            multiplierRules: generateMultipliers()
        },
        residence: {
            bachelorAllowed: true, // Not explicitly forbidden, usually allowed
            hostelAllowed: true, // "Hostel Accommodation : yes"
            ownHouseMandatory: true // "permanent resi verification mandatory" usually implies this or strict checks
        },
        flags: {
            allowsSelfEmployed: false,
            allowsPensioner: true,
            notes: [
                'Co-applicant mandatory for > 50L',
                'Pensioners up to 65 yrs allowed',
                'Foreclosure allowed after 1 EMI'
            ]
        }
    }
];

const fs = require('fs');

const seedDB = async () => {
    try {
        console.log('Connecting to DB...', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        console.log('Clearing existing policies...');
        // await BankPolicy.deleteMany({}); // Optional: Clear all or just upsert. Clearing for clean state.
        // Actually, let's clear to avoid stale data during dev
        await BankPolicy.deleteMany({});

        const policiesDir = path.join(__dirname, '..', 'policies');
        if (fs.existsSync(policiesDir)) {
            const files = fs.readdirSync(policiesDir).filter(f => f.endsWith('.js') || f.endsWith('.json'));

            for (const file of files) {
                const policyData = require(path.join(policiesDir, file));
                console.log(`Seeding policy: ${policyData.name} (${policyData.bankId})`);
                await BankPolicy.create(policyData);
            }
        }

        // Also seed hardcoded HDFC if not present in files (or just move HDFC to a file later)
        // For now, I'll keep HDFC here for backward compat effectively or if user wants it
        // But better to verify if HDFC file exists. 
        // Since I haven't created HDFC file, I will insert the hardcoded one too.
        console.log('Seeding hardcoded HDFC policy...');
        await BankPolicy.create(policies); // policies array from above

        console.log('Success! Policies seeded.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
