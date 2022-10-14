const router = require('express').Router();
const UsersController = require('../controllers/users-controller');

router.post('/sign-in', UsersController.signIn);
router.post('/sign-up', UsersController.signUp);

module.exports = router;
