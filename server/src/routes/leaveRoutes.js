const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { createLeave, myLeaves, listLeaves, reviewLeave } = require('../controllers/leaveController');

// Employee
router.post('/', auth, requireRole('employee'), createLeave);
router.get('/mine', auth, requireRole('employee'), myLeaves);

// Admin
router.get('/', auth, requireRole('admin'), listLeaves);
router.patch('/:id/:action', auth, requireRole('admin'), reviewLeave);

module.exports = router;
