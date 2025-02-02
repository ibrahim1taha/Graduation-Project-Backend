const { validationResult } = require('express-validator');
const customErr = require('../utils/customErr');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otpModel = require('../models/otp');
const sendOTPEmail = require('../utils/sendOTPEmail');

class AuthServices {
	static validationRes = (req) => {
		const validationErr = validationResult(req);
		if (!validationErr.isEmpty()) customErr(422, validationErr.array()[0].msg)
	}

	static generateToken = (user) => {
		return jwt.sign(
			{ userId: user._id, role: user.role },
			process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 * 7 });
	}

	static hashPassword = async (password) => {
		return await bcrypt.hash(password, 12);
	}
	static decodePassword = async (password, user) => {
		const isPassMatch = await bcrypt.compare(password, user.password);
		return isPassMatch;
	}

	static sendOTP = async (user) => {
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
}


module.exports = AuthServices; 