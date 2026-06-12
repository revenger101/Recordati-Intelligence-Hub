const express = require('express');
const router = express.Router();
const empController = require('../controllers/employees.controller');
const { verifyToken, requireRoles } = require('../middleware/auth.middleware');

// MODULE 1: BASE ROUTE - /api/v1/employees

// Protect all routes within this router
router.use(verifyToken);

// [GET] /api/v1/employees
// RBAC: Admins and Managers can see the directory.
router.get('/', requireRoles('Admin', 'Manager'), empController.getAllEmployees);

// [POST] /api/v1/employees
// RBAC: Only Admins (HR) can create a new employee profile.
router.post('/', requireRoles('Admin'), empController.createEmployee);

// [GET] /api/v1/employees/:id
// RBAC: Employee can see their own data, Managers and Admins can see any data.
// (Fine-grained self-check usually happens in controller, but route handles overarching access)
router.get('/:id', requireRoles('Admin', 'Manager', 'Employee'), empController.getEmployeeById);

// [PUT] /api/v1/employees/:id
// RBAC: Only Admin can execute widespread updates on profiles.
router.put('/:id', requireRoles('Admin'), empController.updateEmployee);

// [DELETE] /api/v1/employees/:id
// RBAC: Only Admin can terminate/delete employees. 
// Pass ?hard=true to hard-delete from the database (GDPR right to be forgotten).
router.delete('/:id', requireRoles('Admin'), empController.deleteEmployee);

module.exports = router;
