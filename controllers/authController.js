const bcrypt = require('bcryptjs');
//models 
const userModel = require('../models/users');
const otpModel = require('../models/otp');

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const customErr = require('../utils/customErr');

const sendOTPEmail = require('../utils/sendOTPEmail');

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

		sendOTP(newUser);

		res.status(201).json({
			user: newUser,
			message: 'Account Created Successfully!'
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

		if (user.verified) {
			const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 * 7 })

			res.status(200).json({
				message: 'Login successful.',
				user,
				token
			})
		} else {
			sendOTP(user);
			res.status(200).json({
				user,
				message: 'Verification code sent successfully! ',
			})
		}
	} catch (error) {
		console.log(error);
		next(error);
	}
}

const sendOTP = async (user) => {
	try {

		const OTP = Math.floor(100000 + Math.random() * 900000).toString();
		console.log(OTP);

		await otpModel.findOneAndDelete({ email: user.email });

		await otpModel.create({ email: user.email, otp: OTP });

		sendOTPEmail.sendOTPEmail(user.email, OTP, user.userName);

	} catch (error) {
		console.log(error);
	}
}

const forgetPass = async (req, res, next) => {
	const { email } = req.body;
	try {
		const user = await userModel.findOne({ email });

		if (!user) customErr(404, "this user not found , please Signup");

		sendOTP(user);

		res.status(201).json({
			message: 'OTP sent successfully , please check your mail inbox',
		})
	} catch (error) {
		console.log(error);
		next(error);
	}
}

const changePass = async (req, res, next) => {
	const { email, newPass, confirmPass } = req.body;
	try {
		const user = await userModel.findOne({ email });
		if (!user) customErr(404, "this user not found , please Signup");

		if (newPass !== confirmPass) customErr(422, "passwords not equal");

		const hashedPass = await bcrypt.hash(newPass, 12);
		user.password = hashedPass;
		await user.save();

		res.status(200).json({ message: "Password reset successful" });

	} catch (error) {
		console.log(error);
		next(error);
	}
}

const verifyOTP = async (req, res, next) => {
	const { email, OTP } = req.body;
	try {
		console.log(OTP);
		const isMatch = await otpModel.findOne({ email: email, otp: OTP });

		if (!isMatch) customErr(422, "Wrong OTP!");
		const user = await userModel.findOneAndUpdate({ email: email }, { verified: true }, { new: true });

		const token = jwt.sign(
			{ userId: user._id, role: user.role },
			process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 * 7 });

		res.status(200).json({
			user,
			token,
			message: "Verified successfully , Welcome onboard!"
		})
	} catch (error) {
		console.log(error);
		next(error);
	}
}

module.exports = {
	postSignup, postLogin, sendOTP, verifyOTP, forgetPass, changePass
};