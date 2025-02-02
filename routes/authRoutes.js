const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authValidators = require('../validations/authValidators');
// /auth/signup
router.post('/signup', authValidators.signupValidator, authController.postSignup);
// /auth/login
router.post('/login', authValidators.emailPassValidations, authController.postLogin)
// auth/sendOTP 
router.post('/changePass', authValidators.changePassValidator, authController.changePass);
// auth/sendOTP 
router.post('/forgetPass', authValidators.emailValidator('Invalid Email!'), authController.forgetPass);
// auth/verifyOTP
router.post('/verifyOTP', authValidators.emailValidator('Invalid Email!'), authController.verifyOTP);
// auth/users
router.get('/users', authController.getUsers)

module.exports = router; 
