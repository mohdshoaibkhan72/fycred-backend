const calculateOffers = (data) => {
    const { salary, age, employmentType, existingEmi = 0, companyType = 'Private' } = data;
    const offers = [];

    // Helper to add offer
    const addOffer = (offer) => offers.push(offer);

    // 1. HDFC Bank
    if (employmentType === 'Salaried' && age >= 22 && age <= 61 && salary >= 25000) {
        let multiplier = 18;
        if (salary > 50000) multiplier = 24;
        addOffer({
            id: 'hdfc',
            bankName: 'HDFC Bank',
            logoUrl: 'https://companieslogo.com/img/orig/HDB-bb6241fe.png?t=1720244492',
            eligibleAmount: Math.min(salary * multiplier, 10000000), // Max 1 Cr
            interestRate: salary > 50000 ? 10.75 : 11.25,
            processingFee: 4999,
            tenureRange: [12, 60], // Max 72 normally, 60 safe
            approvalProbability: salary > 35000 ? 'High' : 'Medium',
            tags: ['Pre-Approved', 'Fast Disbursal'],
            isRecommended: salary > 40000
        });
    }

    // 2. ICICI Bank
    if (employmentType === 'Salaried' && age >= 21 && age <= 61 && salary >= 30000) {
        // FOIR based usually, but using multiplier surrogate from text
        let multiplier = 13; // default conservative for >35k
        if (salary > 50000) multiplier = 18;
        addOffer({
            id: 'icici',
            bankName: 'ICICI Bank',
            logoUrl: 'https://companieslogo.com/img/orig/IBN-d5754592.png?t=1720244492',
            eligibleAmount: Math.min(salary * multiplier, 10000000), // Max 1 Cr
            interestRate: 10.99,
            processingFee: 1.25,
            tenureRange: [12, 60],
            approvalProbability: 'High',
            tags: ['Paperless Process'],
            isRecommended: false
        });
    }

    // 3. Axis Bank
    if (employmentType === 'Salaried' && age >= 21 && age <= 60 && salary >= 25000) {
        addOffer({
            id: 'axis',
            bankName: 'Axis Bank',
            logoUrl: 'https://companieslogo.com/img/orig/AXISBANK.BO-8f59e95b.png?t=1720244490',
            eligibleAmount: Math.min(salary * 15, 4000000), // Max 40L
            interestRate: 11.50,
            processingFee: 1.0,
            tenureRange: [12, 60],
            approvalProbability: 'Medium',
            tags: [],
            isRecommended: false
        });
    }

    // 4. Yes Bank
    if (employmentType === 'Salaried' && age >= 21 && age <= 60 && salary >= 20000) {
        let multiplier = 20;
        if (salary > 35000) multiplier = 21;
        if (salary > 75000) multiplier = 22;
        addOffer({
            id: 'yes',
            bankName: 'Yes Bank',
            logoUrl: 'https://companieslogo.com/img/orig/YESBANK.NS-d6a45749.png?t=1720244494',
            eligibleAmount: Math.min(salary * multiplier, 5000000), // Max 50L
            interestRate: 12.00,
            processingFee: 1.5,
            tenureRange: [12, 60],
            approvalProbability: salary > 25000 ? 'High' : 'Medium',
            tags: [],
            isRecommended: false
        });
    }

    // 5. IDFC First Bank
    if (age >= 23 && age <= 60 && salary >= 20000) {
        let foir = 0.5; // <20k 35%, 20-30k 60%? Text says 20k min.
        if (salary >= 20000) foir = 0.6;
        if (salary >= 50000) foir = 0.65;

        // Estimating amount based on FOIR * 60 months roughly
        let amount = (salary * foir) * 40; // Rough multiplier equiv
        addOffer({
            id: 'idfc',
            bankName: 'IDFC First Bank',
            logoUrl: 'https://companieslogo.com/img/orig/IDFCFIRSTB.NS-d1502f6a.png?t=1720244492',
            eligibleAmount: Math.min(amount, 5000000), // Max 50L
            interestRate: 11.99,
            processingFee: 2.0,
            tenureRange: [12, 60],
            approvalProbability: 'High',
            tags: ['No Pre-closure Charges'],
            isRecommended: false
        });
    }

    // 6. Kotak
    if (employmentType === 'Salaried' && age >= 21 && age <= 60 && salary >= 30000) {
        let multiplier = 19;
        if (salary > 50000) multiplier = 26;

        addOffer({
            id: 'kotak',
            bankName: 'Kotak Mahindra',
            logoUrl: 'https://companieslogo.com/img/orig/KOTAKBANK.NS-36420c92.png?t=1720244492',
            eligibleAmount: Math.min(salary * multiplier, 5000000),
            interestRate: 11.25,
            processingFee: 1.5,
            tenureRange: [12, 60],
            approvalProbability: 'Medium',
            tags: [],
            isRecommended: false
        });
    }

    // 7. Bajaj
    if (employmentType === 'Salaried' && age >= 23 && age <= 55 && salary >= 30000) {
        let multiplier = 14;
        addOffer({
            id: 'bajaj',
            bankName: 'Bajaj Finserv',
            logoUrl: 'https://companieslogo.com/img/orig/BAJAJFINSV.NS-69a58fe4.png?t=1720244490',
            eligibleAmount: Math.min(salary * multiplier, 3500000),
            interestRate: 13.0,
            processingFee: 2.0,
            tenureRange: [36, 72],
            approvalProbability: 'High',
            tags: ['Fastest Approval'],
            isRecommended: false
        });
    }

    return offers.sort((a, b) => a.interestRate - b.interestRate);
};

module.exports = { calculateOffers };
