const { registerCompany, login, me } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = require('express').Router();

router.post('/register-company', registerCompany);
router.post('/login', login);
router.get('/me', auth, me);

module.exports = router;
