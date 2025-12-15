// models/Company.js
const mongoose = require('mongoose');

const DEFAULT_CATEGORIES = ['Unknown', 'Listed', 'Unlisted', 'Blacklisted'];

const CompanySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        aliases: [{ type: String, trim: true }],

        // lenderId -> category string (validated in service/controller)
        categories: {
            type: Map,
            of: String,
            default: {}
        },

        // generic fallback (NOT lender-specific)
        defaultCategory: {
            type: String,
            enum: DEFAULT_CATEGORIES,
            default: 'Unlisted'
        },

        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

// Text index for simple search (admin list)
CompanySchema.index({ name: 'text', aliases: 'text' });

module.exports = mongoose.model('Company', CompanySchema);
