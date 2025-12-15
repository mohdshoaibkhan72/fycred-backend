const Company = require('../models/Company');

// Search Companies (for autocomplete)
const searchCompanies = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(200).json({ success: true, data: [] });

        const companies = await Company.find(
            { $text: { $search: query } },
            { score: { $meta: "textScore" } }
        )
            .sort({ score: { $meta: "textScore" } })
            .limit(10);

        res.status(200).json({ success: true, data: companies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create Company
const createCompany = async (req, res) => {
    try {
        // categories is expected to be an object { "HDFC": "Super A", "ICICI": "Cat A" }
        const { name, categories, defaultCategory, aliases } = req.body;

        const company = await Company.create({
            name,
            categories: categories || {},
            defaultCategory: defaultCategory || 'Unlisted',
            aliases
        });
        res.status(201).json({ success: true, data: company });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Company already exists" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Company
const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, categories, defaultCategory, aliases, isActive } = req.body;

        const company = await Company.findByIdAndUpdate(
            id,
            {
                name,
                categories,
                defaultCategory,
                aliases,
                isActive
            },
            { new: true, runValidators: true }
        );

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        res.status(200).json({ success: true, data: company });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Company already exists" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Company
const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findByIdAndDelete(id);

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        res.status(200).json({ success: true, message: "Company deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All (Paginated for Admin)
const getCompanies = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const query = search ? { $text: { $search: search } } : {};

        const companies = await Company.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Company.countDocuments(query);

        res.status(200).json({
            success: true,
            data: companies,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    searchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    getCompanies
};
