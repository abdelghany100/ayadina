const { registerUserCtr, loginUserCtr, forgetPasswordCtr, resetPasswordCtr, verifyOtpCtr } = require('../controller/authController');

const router = require('express').Router();


router.post("/register", registerUserCtr)
router.post("/login", loginUserCtr)
router.post("/forget-password", forgetPasswordCtr)
router.post('/reset-password', resetPasswordCtr);
router.post('/verify-otp', verifyOtpCtr);


module.exports = router;
