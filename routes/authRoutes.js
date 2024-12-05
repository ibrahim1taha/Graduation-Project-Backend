const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authValidators = require('../validtators/authValidators');
// /auth/signup
router.post('/signup', authValidators.signupValidator, authController.postSignup);
// /auth/login
router.post('/login', authValidators.loginValidator, authController.postLogin)


module.exports = router; 
