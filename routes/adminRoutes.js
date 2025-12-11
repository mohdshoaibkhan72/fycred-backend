const express = require('express');
const router = express.Router();
const PersonalLoan = require('../models/PersonalLoan');
const HomeLoan = require('../models/HomeLoan');
const BalanceTransfer = require('../models/BalanceTransfer');

// Helper types
const TYPES = ['Personal Loan', 'Home Loan', 'Balance Transfer'];

router.get('/overview', async (req, res) => {
    try {
        const projection = 'status createdAt amount loanAmount outstandingPrincipal fullName';

        const [plApps, hlApps, btApps] = await Promise.all([
            PersonalLoan.find({}, projection).lean(),
            HomeLoan.find({}, projection).lean(),
            BalanceTransfer.find({}, projection).lean()
        ]);

        const normalize = (items, type) => items.map(i => ({
            ...i,
            loanType: type,
            amount: i.amount || i.loanAmount || i.outstandingPrincipal
        }));

        const allApps = [
            ...normalize(plApps, 'Personal Loan'),
            ...normalize(hlApps, 'Home Loan'),
            ...normalize(btApps, 'Balance Transfer')
        ];

        const stats = {
            total: allApps.length,
            pending: allApps.filter(a => a.status === 'pending').length,
            approved: allApps.filter(a => a.status === 'approved').length,
            rejected: allApps.filter(a => a.status === 'rejected').length,
            disbursed: allApps.filter(a => a.status === 'disbursed').length,
            plCount: plApps.length,
            hlCount: hlApps.length,
            btCount: btApps.length,
            recent: allApps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Overview Stats Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/disbursements', async (req, res) => {
    try {
        const projection = 'status createdAt updatedAt amount loanAmount outstandingPrincipal fullName';
        const query = { status: 'disbursed' };

        const [plApps, hlApps, btApps] = await Promise.all([
            PersonalLoan.find(query, projection).lean(),
            HomeLoan.find(query, projection).lean(),
            BalanceTransfer.find(query, projection).lean()
        ]);

        const normalize = (items, type) => items.map(i => ({
            ...i,
            loanType: type,
            amount: i.amount || i.loanAmount || i.outstandingPrincipal
        }));

        const disbursedApps = [
            ...normalize(plApps, 'Personal Loan'),
            ...normalize(hlApps, 'Home Loan'),
            ...normalize(btApps, 'Balance Transfer')
        ];

        // Calculations
        const totalAmount = disbursedApps.reduce((sum, app) => sum + (app.amount || 0), 0);
        const count = disbursedApps.length;
        const avgTicket = count ? Math.round(totalAmount / count) : 0;

        // Monthly Breakdown
        const monthlyMap = {};
        disbursedApps.forEach(app => {
            const date = new Date(app.updatedAt || app.createdAt);
            const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });

            if (!monthlyMap[key]) {
                monthlyMap[key] = { label: key, amount: 0, count: 0, dateOrder: date.getTime() };
            }
            monthlyMap[key].amount += (app.amount || 0);
            monthlyMap[key].count += 1;
        });

        const monthlyData = Object.values(monthlyMap).sort((a, b) => a.dateOrder - b.dateOrder);

        const recent = disbursedApps.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5);

        res.json({
            success: true,
            data: {
                summary: { totalAmount, count, avgTicket },
                monthly: monthlyData,
                recent
            }
        });

    } catch (error) {
        console.error('Disbursement Stats Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
