const { body } = require('express-validator');
const userModel = require('../models/users');

const emailValidator = (message) => {
	return body('email', message).trim().isEmail().toLowerCase()
}

const passValidator = () => {
	return body('password', "password must be more than 8 characters").trim().isLength({ min: 8 })
}

const confirmPassValidator = () => {
	return body('confirmPassword', 'Passwords do not match.').custom((val, { req }) => {
		return val === req.body.password
		// if (val !== req.body.password) customErr(422, 'confirm password not match password!');
	})
}

const isUserExists = async (userEmail) => {
	const user = await userModel.findOne({ email: userEmail });
	if (user) throw new Error("email already exist!");
	return true;
}

/// validators 

const signupValidator = [
	body('userName', "User name required!").trim().notEmpty(),
	emailValidator('Invalid Email !').custom(isUserExists), passValidator(),
	confirmPassValidator()
];


const emailPassValidations = [
	emailValidator('Invalid Email!'),
	body('password', "password must be more than 8 characters").isLength({ min: 8 })
];

const changePassValidator = [
	emailValidator('Invalid Email!'), passValidator(), confirmPassValidator()
];


module.exports = { signupValidator, emailPassValidations, passValidator, emailValidator, changePassValidator }