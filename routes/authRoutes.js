const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authValidators = require('../validtators/authValidators');
// /auth/signup
router.post('/signup', authValidators.signupValidator, authController.postSignup);
// /auth/login
router.post('/login', authValidators.emailPassValidations, authController.postLogin)
// auth/sendOTP 
router.post('/changePass', authValidators.emailPassValidations, authController.changePass);
// auth/sendOTP 
router.post('/forgetPass', authController.forgetPass);
// auth/verifyOTP
router.post('/verifyOTP', authController.verifyOTP);
// auth/users
router.get('/users', authController.getUsers)

module.exports = router; 
