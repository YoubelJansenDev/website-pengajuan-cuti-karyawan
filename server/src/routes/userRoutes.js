const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { listUsers, inviteUser, updateBalance, deleteUser } = require('../controllers/userController');

// Semua route user khusus admin
router.use(auth, requireRole('admin'));

router.get('/', listUsers);
router.post('/invite', inviteUser);
router.patch('/:id/balance', updateBalance);
router.delete('/:id', deleteUser);

module.exports = router;
