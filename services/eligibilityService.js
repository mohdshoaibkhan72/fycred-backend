const BankPolicy = require('../models/BankPolicy');
const Company = require('../models/Company');

// Core Calculation Engine
const calculateOffers = async (data) => {
    try {
        const { salary, age, employmentType, existingEmi = 0, companyName } = data;

        // 1. Identify Company Data
        let companyData = null;
        if (companyName) {
            companyData = await Company.findOne({
                $or: [
                    { name: new RegExp(companyName, 'i') },
                    { aliases: new RegExp(companyName, 'i') }
                ]
            });
        }

        console.log(`Calculating for: ${companyName || 'Unknown'} | Company Found: ${companyData ? 'Yes' : 'No'}`);

        // 2. Fetch Policies
        const policies = await BankPolicy.find({
            $or: [
                { 'basic.minNetSalary': { $lte: salary } },
                { 'basic.minAge': { $lte: age } }
            ]
        });

        // 3. Process Policies
        const offers = [];

        for (const policy of policies) {
            // Basic Checks
            if (policy.basic.minNetSalary > salary) continue;
            if (age < policy.basic.minAge || age > policy.basic.maxAge) continue;
            if (policy.customerTypes.length > 0 && !policy.customerTypes.includes(employmentType.toLowerCase().replace(' ', '-'))) continue; // 'Salaried' -> 'salaried'

            // Determine Company Category for THIS Bank
            let companyCategory = 'Unlisted';
            if (companyData) {
                // Check if specific mapping exists for this bank (e.g., 'HDFC')
                if (companyData.categories && companyData.categories.has(policy.bankId)) {
                    companyCategory = companyData.categories.get(policy.bankId);
                } else {
                    // Fallback to global default
                    companyCategory = companyData.defaultCategory || 'Unlisted';
                }
            }

            // Determine Multiplier
            // Default 0 implies not eligible unless rule matches
            let multiplier = 0;
            let ruleSource = 'Default';

            // Check Multiplier Rules (from most specific to least)
            // Rules are array objects in DB. We filter for matching salary range & category
            if (policy.credit.multiplierRules && policy.credit.multiplierRules.length > 0) {
                // Find rule for this Category + Salary
                const specificRule = policy.credit.multiplierRules.find(r =>
                    r.category === companyCategory &&
                    salary >= r.incomeMin &&
                    salary <= r.incomeMax
                );

                if (specificRule) {
                    multiplier = specificRule.multiplier;
                    ruleSource = `Category ${companyCategory}`;
                } else {
                    // Fallback: Rule without category (General Salaried)
                    const generalRule = policy.credit.multiplierRules.find(r =>
                        (!r.category || r.category === 'Any' || r.category === 'Unlisted') &&
                        salary >= r.incomeMin &&
                        salary <= r.incomeMax
                    );
                    if (generalRule) {
                        multiplier = generalRule.multiplier;
                        ruleSource = 'General Income';
                    }
                }
            }

            // Hard fallback if DB has no rules but policy exists (Manual Overrides for demo)
            if (multiplier === 0) {
                if (policy.bankId === 'HDFC') multiplier = companyCategory === 'Super A' ? 24 : 18;
                else if (policy.bankId === 'ICICI') multiplier = companyCategory === 'Super A' ? 22 : 15;
                else multiplier = 10;
            }

            if (multiplier > 0) {
                const maxLoan = Math.min(salary * multiplier, policy.basic.maxLoanAmount);

                offers.push({
                    id: policy.bankId,
                    bankName: policy.name,
                    logoUrl: policy.logoUrl || `https://ui-avatars.com/api/?name=${policy.name}&background=random`,
                    eligibleAmount: Math.round(maxLoan),
                    interestRate: 11.0, // Should come from policy too eventually
                    processingFee: 1.0,
                    tenureRange: [policy.basic.minTenureMonths, policy.basic.maxTenureMonths],
                    approvalProbability: companyCategory === 'Super A' || companyCategory === 'Cat A' ? 'High' : 'Medium',
                    tags: companyCategory !== 'Unlisted' ? ['Corp Offer', 'Low Rate'] : [],
                    isRecommended: multiplier >= 20
                });
            }
        }

        return offers.sort((a, b) => b.eligibleAmount - a.eligibleAmount);

    } catch (error) {
        console.error("Calculation Engine Error:", error);
        return [];
    }
};

module.exports = { calculateOffers };
