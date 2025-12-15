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
                // Handle both Mongoose Map (if standard doc) and Object (if .lean())
                let mappedCategory = null;
                if (companyData.categories) {
                    if (typeof companyData.categories.get === 'function') {
                        mappedCategory = companyData.categories.get(policy.bankId);
                    } else if (typeof companyData.categories === 'object') {
                        // Fallback for plain object (lean queries / debugging)
                        mappedCategory = companyData.categories[policy.bankId];
                    }
                }

                if (mappedCategory) {
                    companyCategory = mappedCategory;
                } else {
                    // Fallback to global default
                    companyCategory = companyData.defaultCategory || 'Unlisted';
                }
            }

            // Debug Mismatch
            // console.log(`[Engine] Bank: ${policy.bankId} | Company Cat: ${companyCategory}`);

            // Determine Multiplier
            // Default 0 implies not eligible unless rule matches
            let multiplier = 0;
            let ruleSource = 'Default';

            // Check Multiplier Rules (from most specific to least)
            if (policy.credit.multiplierRules && policy.credit.multiplierRules.length > 0) {
                // 1. Filter all rules that match the Category and Salary Logic
                const matchingRules = policy.credit.multiplierRules.filter(r =>
                    (r.category === companyCategory || r.category === 'Any' || (!r.category)) &&
                    salary >= r.incomeMin &&
                    salary <= r.incomeMax
                );

                if (matchingRules.length > 0) {
                    // 2. Prioritize Exact Category Matches (e.g., 'Super A' > 'Any')
                    const exactMatches = matchingRules.filter(r => r.category === companyCategory);
                    const candidates = exactMatches.length > 0 ? exactMatches : matchingRules;

                    // 3. Select the Rule with the HIGHEST Multiplier
                    // This creates the "Max Eligible Amount" by picking the best tenure option automatically
                    const bestRule = candidates.reduce((prev, current) =>
                        (current.multiplier > prev.multiplier) ? current : prev
                    );

                    multiplier = bestRule.multiplier;
                    ruleSource = `Match: ${bestRule.category || 'Any'} (x${multiplier})`;

                    // console.log(`[Engine] Found Best Rule for ${policy.name}: x${multiplier} (Tenure: ${bestRule.tenure || 'N/A'})`);
                }
            }

            // Fallback: If no DB rules matched or Bank has no rules
            if (multiplier === 0) {
                // Default safety fallback for banks without specific rules (e.g., Axis, Indusind initially)
                multiplier = 10;
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
