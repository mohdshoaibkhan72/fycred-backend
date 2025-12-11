const BankPolicy = require('../models/BankPolicy');

// Helper function to check a single applicant against a single policy
const checkApplicantAgainstPolicy = (applicant, policy) => {
    const failedReasons = [];

    // --- 1. Basic Rules ---
    if (!policy.customerTypes.includes(applicant.customerType)) {
        failedReasons.push("Customer type not allowed");
    }

    // Age
    if (applicant.age < policy.basic.minAge || applicant.age > policy.basic.maxAge) {
        failedReasons.push(`Age (${applicant.age}) not within allowed range (${policy.basic.minAge}-${policy.basic.maxAge})`);
    }

    // Salary
    if (applicant.netMonthlySalary < policy.basic.minNetSalary) {
        failedReasons.push(`Salary (${applicant.netMonthlySalary}) below minimum (${policy.basic.minNetSalary})`);
    }

    // Loan Amount
    if (applicant.loanAmountRequested < policy.basic.minLoanAmount || applicant.loanAmountRequested > policy.basic.maxLoanAmount) {
        failedReasons.push(`Requested amount (${applicant.loanAmountRequested}) outside allowed range (${policy.basic.minLoanAmount}-${policy.basic.maxLoanAmount})`);
    }

    // Tenure
    if (applicant.tenureMonthsRequested < policy.basic.minTenureMonths || applicant.tenureMonthsRequested > policy.basic.maxTenureMonths) {
        failedReasons.push(`Tenure (${applicant.tenureMonthsRequested}) outside allowed range (${policy.basic.minTenureMonths}-${policy.basic.maxTenureMonths})`);
    }

    // --- 2. Employment Rules ---
    if (applicant.currentJobMonths < policy.employment.minCurrentJobMonths) {
        failedReasons.push("Current job vintage too low");
    }
    if (applicant.totalExperienceMonths < policy.employment.minTotalExpMonths) {
        failedReasons.push("Total experience too low");
    }

    // Company Category
    if (policy.employment.allowedCompanyCategories && policy.employment.allowedCompanyCategories.length > 0) {
        // If categories are restricted, check if applicant's category is in the list
        // Note: If applicant has no category or policy doesn't restrict, this might need adjustment based on business logic
        if (applicant.companyCategory && !policy.employment.allowedCompanyCategories.includes(applicant.companyCategory)) {
            failedReasons.push(`Company category '${applicant.companyCategory}' not allowed`);
        }
    }

    if (policy.employment.mcaRequired && !applicant.isMcaListed) {
        failedReasons.push("Company not MCA listed");
    }

    // --- 3. Credit Rules ---
    if (applicant.isNewToCredit || !applicant.cibilScore || applicant.cibilScore === -1) {
        if (!policy.credit.allowCibil0To1) {
            failedReasons.push("New-to-credit (CIBIL 0/-1) not allowed");
        }
    } else {
        if (policy.credit.minCibil && applicant.cibilScore < policy.credit.minCibil) {
            failedReasons.push(`CIBIL score (${applicant.cibilScore}) below minimum (${policy.credit.minCibil})`);
        }
    }

    // --- 4. Housing Rules ---
    if (applicant.isBachelor && !policy.residence.bachelorAllowed) {
        failedReasons.push("Bachelors not allowed");
    }
    if (applicant.residenceType === 'hostel' && !policy.residence.hostelAllowed) {
        failedReasons.push("Hostel accommodation not allowed");
    }
    if (policy.residence.ownHouseMandatory && applicant.residenceType !== 'owned' && !applicant.hasOwnHouseProof) {
        failedReasons.push("Own house proof required");
    }

    // --- Calculations (FOIR & Multiplier) ---
    // These only run if basic eligibility passes (or we can calculate them anyway to show 'potential')
    // We'll calculate them regardless for transparency

    let maxAmountByFoir = 0;
    let maxAmountByMultiplier = 0;

    // FOIR Calculation
    if (policy.credit.foirRules && policy.credit.foirRules.length > 0) {
        const row = policy.credit.foirRules.find(
            r => applicant.netMonthlySalary >= r.incomeMin && applicant.netMonthlySalary <= r.incomeMax
        );

        if (row) {
            const allowedEmi = (applicant.netMonthlySalary * (row.foirPercent / 100)) - (applicant.totalExistingEmi || 0);

            if (allowedEmi > 0) {
                // Approximate Loan Amount from EMI
                // Formula: PV = PMT * ( (1 - (1+r)^-n) / r )
                const ratePerMonth = 0.18 / 12; // Assuming 18% p.a. as a standard base rate for check
                const n = applicant.tenureMonthsRequested || 60; // Default 5 years if not specified

                maxAmountByFoir = allowedEmi * ((1 - Math.pow(1 + ratePerMonth, -n)) / ratePerMonth);
            }
        }
    }

    // Multiplier Calculation
    if (policy.credit.multiplierRules && policy.credit.multiplierRules.length > 0) {
        const row = policy.credit.multiplierRules.find(
            r => applicant.netMonthlySalary >= r.incomeMin &&
                applicant.netMonthlySalary <= r.incomeMax &&
                (!r.category || r.category === applicant.companyCategory)
        );
        if (row) {
            maxAmountByMultiplier = applicant.netMonthlySalary * row.multiplier;
        }
    }

    // Refined Eligibility Check for Amount
    // If calculated limits exist, checking if requested amount is within them
    if (maxAmountByFoir > 0 && applicant.loanAmountRequested > maxAmountByFoir) {
        failedReasons.push(`Calculated FOIR limit (approx ₹${Math.round(maxAmountByFoir)}) is less than requested amount`);
    }
    if (maxAmountByMultiplier > 0 && applicant.loanAmountRequested > maxAmountByMultiplier) {
        failedReasons.push(`Multiplier limit (₹${Math.round(maxAmountByMultiplier)}) is less than requested amount`);
    }

    const eligible = failedReasons.length === 0;

    return {
        bankId: policy.bankId,
        bankName: policy.name,
        eligible,
        failedReasons,
        finalMaxAmount: Math.min(maxAmountByFoir || Infinity, maxAmountByMultiplier || Infinity, policy.basic.maxLoanAmount), // The strict minimum of all limits
        calculations: {
            maxAmountByFoir: Math.round(maxAmountByFoir),
            maxAmountByMultiplier: Math.round(maxAmountByMultiplier)
        }
    };
};

// Check Eligibility
exports.checkEligibility = async (req, res) => {
    try {
        const applicant = req.body;

        // Fetch all active policies
        // We could optimize by filtering basics (salary, age) in the DB query, but let's fetch all for detailed "Reasons for rejection"
        const policies = await BankPolicy.find({});

        const results = policies.map(policy => checkApplicantAgainstPolicy(applicant, policy));

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });

    } catch (error) {
        console.error("Eligibility Check Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Add Policy
exports.addPolicy = async (req, res) => {
    try {
        const policyData = req.body;

        // Check if bankId exists
        const existing = await BankPolicy.findOne({ bankId: policyData.bankId });
        if (existing) {
            return res.status(400).json({ success: false, message: `Policy for Bank ID ${policyData.bankId} already exists.` });
        }

        const newPolicy = new BankPolicy(policyData);
        await newPolicy.save();

        res.status(201).json({
            success: true,
            data: newPolicy
        });
    } catch (error) {
        console.error("Add Policy Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Get All Policies
exports.getPolicies = async (req, res) => {
    try {
        const policies = await BankPolicy.find({});
        res.status(200).json({ success: true, count: policies.length, data: policies });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Delete Policy
exports.deletePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        await BankPolicy.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Policy deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Update Policy
exports.updatePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPolicy = await BankPolicy.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedPolicy) {
            return res.status(404).json({ success: false, message: "Policy not found" });
        }
        res.status(200).json({ success: true, data: updatedPolicy });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
