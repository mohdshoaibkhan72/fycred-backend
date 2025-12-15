const express = require('express');
const router = express.Router();
const {
    getOverviewStats,
    getDisbursementStats,
    getPolicies,
    addPolicy,
    deletePolicy,
    updatePolicy
} = require('../controllers/exportAdmin');
const { getCompanies, createCompany, searchCompanies, updateCompany, deleteCompany } = require('../controllers/companyController');

router.get('/overview', getOverviewStats);
router.get('/disbursements', getDisbursementStats);

// Policy Routes
router.get('/policies', getPolicies);
router.post('/policies', addPolicy);
router.delete('/policies/:id', deletePolicy);
router.put('/policies/:id', updatePolicy);

// Company Routes
router.get('/companies', getCompanies);
router.post('/companies', createCompany);
router.put('/companies/:id', updateCompany);
router.delete('/companies/:id', deleteCompany);
router.get('/companies/search', searchCompanies);

module.exports = router;
