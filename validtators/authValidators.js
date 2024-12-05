const { body } = require('express-validator');
const userModel = require('../models/users');

const signupValidator = [

	body('userName', "User name required!").trim().notEmpty(),

	body('email', "invalid email!").trim().isEmail().normalizeEmail().custom(async (val, { req }) => {
		const user = await userModel.findOne({ email: val });
		if (user) throw new Error("email already exist!");
	}),

	body('password', "password must be more than 8 characters").trim().isLength({ min: 8 }),

	body('confirmPassword', 'Passwords do not match.').custom((val, { req }) => {
		return val === req.body.password
		// if (val !== req.body.password) customErr(422, 'confirm password not match password!');
	})

];


const loginValidator = [
	body('email', "invalid Email").trim().isEmail().normalizeEmail(),
	body('password', "password must be more than 8 characters").isLength({ min: 8 })
];

module.exports = { signupValidator, loginValidator }