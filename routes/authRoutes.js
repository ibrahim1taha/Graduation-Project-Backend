const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authValidators = require('../validtators/authValidators');
// /auth/signup
router.post('/signup', authValidators.signupValidator, authController.postSignup);
// /auth/login
router.post('/login', authValidators.loginValidator, authController.postLogin)
// auth/sendOTP 
router.post('/changePass', authController.changePass);
// auth/sendOTP 
router.post('/forgetPass', authController.forgetPass);
// auth/verifyOTP
router.post('/verifyOTP', authController.verifyOTP);

module.exports = router; 
