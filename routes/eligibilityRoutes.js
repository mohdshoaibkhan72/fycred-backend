const express = require('express');
const router = express.Router();
const eligibilityController = require('../controllers/eligibilityController');

// Check Eligibility
router.post('/check', eligibilityController.checkEligibility);

// Policy Management
router.post('/policies', eligibilityController.addPolicy);
router.get('/policies', eligibilityController.getPolicies);
router.put('/policies/:id', eligibilityController.updatePolicy);
router.delete('/policies/:id', eligibilityController.deletePolicy);

module.exports = router;
