const bcrypt = require('bcryptjs');
const userModel = require('../models/users');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const customErr = require('../utils/customErr');

const postSignup = async (req, res, next) => {
	try {
		const validationErr = validationResult(req);
		console.log(validationErr.array());
		if (!validationErr.isEmpty()) return res.status(422).json({
			message: "validation errors",
			errors: validationErr.array()
		});

		const { userName, email, role, password } = req.body;

		const hashedPass = await bcrypt.hash(password, 12);

		const newUser = new userModel({ userName: userName, email: email, role: role, password: hashedPass });

		await newUser.save();

		const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 * 7 })

		res.status(201).json({
			user: newUser,
			token: token,
			message: 'Signup Successfully!'
		})

	} catch (err) {
		console.log(err);
		next(err);
	}
}

const postLogin = async (req, res, next) => {
	const validationErr = validationResult(req);
	if (!validationErr.isEmpty()) return res.status(422).json({
		message: "validation error",
		errors: validationErr.array()
	});

	const { email, password } = req.body;

	try {
		const user = await userModel.findOne({ email });
		if (!user) return res.status(404).json({ message: "Invalid Email or Password!" });

		const isPassMatch = await bcrypt.compare(password, user.password);
		if (!isPassMatch) return res.status(404).json({ message: "Invalid Email or Password!" });

		const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 * 7 })

		res.status(200).json({
			message: 'Login successful.',
			token
		})
	} catch (error) {
		console.log(error);
		next(error);
	}
}

module.exports = {
	postSignup, postLogin
};