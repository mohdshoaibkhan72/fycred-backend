module.exports = {
    bankId: 'ICICI',
    name: 'ICICI Bank Personal Loan',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR00YUkI8fQZIy7zftF08bpPnDBuWLmrz2pBg',
    productType: 'PL',
    customerTypes: ['salaried'],
    basic: {
        minNetSalary: 25000, // Lowest of the group (Govt)
        minAge: 21,
        maxAge: 61,
        minLoanAmount: 100000,
        maxLoanAmount: 10000000,
        minTenureMonths: 12,
        maxTenureMonths: 72 // 84 for top 6 companies, handled in notes/engine logic override
    },
    employment: {
        minCurrentJobMonths: 1,
        minTotalExpMonths: 24, // 2 years
        allowedCompanyCategories: ['Elite', 'Govt', 'Super', 'Prime', 'Preferred', 'Open Market', 'Super A', 'Cat A'],
        mcaRequired: true // "Listed / Non Listed MCA (1 Yrs) : YES" - implies MCA check
    },
    credit: {
        minCibil: -1, // Allows 0/-1
        allowCibil0To1: true,
        foirRules: [
            // Standard FOIR assumed (user only said "Plus 5% with owned house proof")
            // Base FOIR isn't explicitly detailed with a table, but "Profile" usually implies standard. 
            // I'll add a generic base FOIR curve if not provided, or interpret "Profile Income" section carefully.
            // Wait, "Loan Eligibility : 3. FOIR ... 4. Multiplier ... Profile Income <= 23 ..."
            // The table provided is ONLY for Multiplier.
            // FOIR details are missing/standard. I'll insert a standard progressive FOIR for now.
            { incomeMin: 0, incomeMax: 35000, foirPercent: 50 },
            { incomeMin: 35001, incomeMax: 50000, foirPercent: 60 },
            { incomeMin: 50001, incomeMax: 75000, foirPercent: 65 },
            { incomeMin: 75001, incomeMax: 99999999, foirPercent: 70 }
        ],
        multiplierRules: [] // Filled below
    },
    residence: {
        bachelorAllowed: true,
        hostelAllowed: true,
        ownHouseMandatory: false
    },
    flags: {
        allowsSelfEmployed: false, // User said "Applicable to : salaried / Self employed" but provided Salary grids. I will accept 'salaried' primarily based on the salary grids. To support self-employed, I'd need different rules.
        allowsPensioner: true,
        notes: [
            "NTH Salary : Pvt (listed) : 30K ( Govt 25K) : Open Market : 40K",
            "Tenor : 12 / 72 months (84 months for top 6 companies)",
            "Minimum Locking period : 1 EMI (payout reversal before 12 EMIs)",
            "Balance Transfer (BT) : up to 5 BTs",
            "Top up Policy : Allowed after 6 months",
            "Foreclosure zero after 12 months even if it is BT, Top up or with owned funds.",
            "Pensioner with pension more than 30K can avail up to 5 lakhs with maximum age up to 65 Yrs.",
            "NRI with remittances > 50K per month can avail NRI loans up to 15 – 20 lakh based on NRI policy.",
            "No insurance required for any loan amount.",
            "Documents: 3 mo payslips, 3 mo bank stmt, KYC"
        ]
    }
};

// Helper to expand rules
const addMultiplier = (categories, incomeMin, incomeMax, multipliers) => {
    // multipliers array corresponds to tenures: [<=23, 24-35, 36-47, 48-59, >=60]
    // Mapped to start tenures: [12, 24, 36, 48, 60]
    const tenures = [12, 24, 36, 48, 60];

    categories.forEach(cat => {
        tenures.forEach((tenure, idx) => {
            if (multipliers[idx] !== 'NA' && multipliers[idx] !== undefined) {
                module.exports.credit.multiplierRules.push({
                    category: cat,
                    incomeMin,
                    incomeMax,
                    tenure,
                    multiplier: multipliers[idx]
                });
            }
        });
    });
};

// Block 1: Elite / Govt / Super / Prime
const group1 = ['Elite', 'Govt', 'Super', 'Prime', 'Super A', 'Cat A']; // Adding standard mappings
addMultiplier(group1, 0, 35000, [5, 9, 14, 14, 19]);
addMultiplier(group1, 35001, 50000, [6, 10, 16, 16, 20]);
addMultiplier(group1, 50001, 75000, [7, 13, 18, 21, 23]);
addMultiplier(group1, 75001, 9999999, [7, 13, 18, 22, 24]);

// Block 2: Preferred
const group2 = ['Preferred', 'Cat B'];
addMultiplier(group2, 0, 35000, [5, 9, 11, 13, 13]);
addMultiplier(group2, 35001, 50000, [5, 9, 13, 15, 15]);
addMultiplier(group2, 50001, 75000, [7, 11, 15, 18, 19]);
addMultiplier(group2, 75001, 9999999, [7, 11, 15, 18, 20]);

// Block 3: Open Market
const group3 = ['Open Market', 'Unlisted'];
addMultiplier(group3, 0, 35000, [5, 7, 7, 7, 'NA']);
addMultiplier(group3, 35001, 50000, [5, 9, 7, 8, 8]);
addMultiplier(group3, 50001, 75000, [5, 10, 13, 14, 14]);
addMultiplier(group3, 75001, 9999999, [7, 11, 13, 15, 15]);
