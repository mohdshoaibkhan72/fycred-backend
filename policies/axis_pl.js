module.exports = {
    bankId: 'AXIS',
    name: 'Axis Bank Personal Loan',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRt4ed4mwqvt-7_Whx__Xsy6fq4kG5U2T2wA',
    productType: 'PL',
    customerTypes: ['salaried'],
    basic: {
        minNetSalary: 25000, // Based on Internal Super A & Cat A. External is 35k. Engine will need to handle company cat logic, but lowest hard floor is 25k.
        minAge: 21,
        maxAge: 60, // Note: Govt is 54, handled in notes/engine override if specific type passed
        minLoanAmount: 100000,
        maxLoanAmount: 4000000,
        minTenureMonths: 12,
        maxTenureMonths: 60
    },
    employment: {
        minCurrentJobMonths: 1,
        minTotalExpMonths: 12, // 1 yr
        allowedCompanyCategories: ['Super A', 'Cat A', 'Cat B', 'Cat C', 'Cat D', 'Govt', 'External'],
        mcaRequired: true // "Listed / Non Listed MCA (1 Yrs) : YES"
    },
    credit: {
        minCibil: -1, // Allows 0/-1
        allowCibil0To1: true,
        foirRules: [
            // "For NTH > 40K FOIR is taken as 80%"
            // Adjusted per user feedback: < 40K is effectively "not eligible" via FOIR calc as no rule defined.
            // If the engine requires a rule to process at all, we might need a dummy low one, but usually empty/no-match means reject or default.
            // Will set explicit start from 40001.
            { incomeMin: 40001, incomeMax: 99999999, foirPercent: 80 }
        ],
        multiplierRules: [] // "Multiplier Not Applicable"
    },
    residence: {
        bachelorAllowed: false, // "Bachelor Accommodation : No"
        hostelAllowed: false,   // "Hostel Accommodation : No"
        ownHouseMandatory: false
    },
    flags: {
        allowsSelfEmployed: false, // "Applicable to : salaried"
        allowsPensioner: false,
        notes: [
            "NTH Salary : Internal ---Super A & Cat A : 25K; Cat B & C : 35K; External > 35K; Cat D : 60K",
            "Max Age: 60 yrs (Except Govt : 54 yrs)",
            "Bachelor Accommodation : No",
            "Hostel Accommodation : No",
            "Documents Required: Form 16 mandatory",
            "Foreclosure zero after 12 months even if it is BT, Top up or with owned funds.",
            "Foreclosure allowed after 1 EMI / Partial payment allowed",
            "Balance Transfer (BT) : up to 3 BTs",
            "LIC agents & Consultant Doctors can also avail PL up to 40 lakh"
        ]
    }
};
