const express = require('express');
const router = express.Router();
const rectController = require('../controllers/recruitment.controller');
const { verifyToken, requireRoles } = require('../middleware/auth.middleware');

// MODULE 2: PIPELINE ATS - /api/v1/recruitment

// [POST] /api/v1/recruitment/jobs
// RBAC: Only Admin/HR can open a new job requisition.
router.post('/jobs', verifyToken, requireRoles('Admin'), rectController.createJobRequisition);

// [GET] /api/v1/recruitment/jobs
// Fetch all open positions (can be public or authenticated dependending on ATS config)
router.get('/jobs', rectController.getOpenJobs);

// [POST] /api/v1/recruitment/apply
// Public endpoint: Candidates submitting their applications to a specific Job ID.
router.post('/apply', rectController.applyForJob);

// [PUT] /api/v1/recruitment/applications/:id
// RBAC: HR and Managers pipeline progression (Screening -> Interview -> Offer -> Hired)
router.put('/applications/:id', verifyToken, requireRoles('Admin', 'Manager'), rectController.updateApplicationStage);

// [PUT] /api/v1/recruitment/onboarding/:tracker_id/complete
// RBAC: Employees and Managers can check off their respective integration tasks
router.put('/onboarding/:tracker_id/complete', verifyToken, requireRoles('Admin', 'Manager', 'Employee'), rectController.checkOffOnboardingTask);

module.exports = router;
