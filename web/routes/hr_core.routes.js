const express = require('express');
const router = express.Router();
const coreController = require('../controllers/hr_core.controller');
const { verifyToken, requireRoles } = require('../middleware/auth.middleware');

// ==========================================
// ROUTES FOR MODULES 4 TO 10
// ==========================================

// MODULE 4: PAYROLL
// RBAC: Only HR Admins can generate payroll configurations
router.post('/payroll/generate', verifyToken, requireRoles('Admin'), coreController.generatePayrollCycle);

// MODULE 5: PERFORMANCE REVIEWS
// RBAC: Only Managers and Admins can record employee performance OKRs
router.post('/performance/reviews', verifyToken, requireRoles('Admin', 'Manager'), coreController.recordPerformanceReview);

// MODULE 6: LMS & TRAINING
// RBAC: HR Admins issue Certifications to employee files
router.post('/training/certifications', verifyToken, requireRoles('Admin'), coreController.assignCertification);

// MODULE 8: SELF SERVICE PORTAL
// RBAC: Every authenticated user (Employee) gets access to their personal vault
router.get('/portal/me', verifyToken, requireRoles('Employee', 'Manager', 'Admin'), coreController.getMyPortalData);

// MODULE 9: ANALYTICS & REPORTING
// RBAC: Executive dashboard data restricted to upper management
router.get('/analytics/dashboard', verifyToken, requireRoles('Admin', 'Manager'), coreController.getAnalyticsDashboard);

module.exports = router;
