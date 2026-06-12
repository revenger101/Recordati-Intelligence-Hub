const express = require('express');
const router = express.Router();
const timeController = require('../controllers/time_tracking.controller');
const { verifyToken, requireRoles } = require('../middleware/auth.middleware');

// MODULE 3: TIME TRACKING - /api/v1/time

// [POST] /api/v1/time/leaves
// RBAC: Any registered Employee can request a leave.
router.post('/leaves', verifyToken, requireRoles('Employee', 'Manager', 'Admin'), timeController.submitLeaveRequest);

// [PUT] /api/v1/time/leaves/:request_id/approve
// RBAC: Only Managers or HR Admins can APPROVE a leave.
router.put('/leaves/:request_id/approve', verifyToken, requireRoles('Manager', 'Admin'), timeController.approveLeaveRequest);

// [POST] /api/v1/time/clock
// RBAC: Pointeuse (Clock-in/out). Relies on logged in user context.
router.post('/clock', verifyToken, requireRoles('Employee', 'Manager', 'Admin'), timeController.clockInOut);

module.exports = router;
