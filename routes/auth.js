const express = require('express');
const router = express.Router()
const {registerUser, loginUser, forgotPassword, resetPassword, logOut} = require("../controllers/authController");
const { isAuthenticatedUser } = require('../middlewares/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/password/forgot', forgotPassword);
router.patch("/password/reset/:token", resetPassword);
router.get('/logout', isAuthenticatedUser, logOut)

module.exports = router;