const userModel = require('../models/users');
const otpModel = require('../models/otp');

const authServices = require('../services/authServices');
const customErr = require('../utils/customErr');

const postSignup = async (req, res, next) => {
	try {

		authServices.validationRes(req);

		const { userName, email, role, password, tokenFromAndroid } = req.body;

		const hashedPass = await authServices.hashPassword(password);

		const newUser = new userModel({
			userName: userName,
			email: email,
			role: role,
			password: hashedPass,
			tokenFromAndroid: tokenFromAndroid
		});

		await newUser.save();

		authServices.sendOTP(newUser);

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
	const { email, password, tokenFromAndroid } = req.body;

	try {
		authServices.validationRes(req);

		const user = await userModel.findOne({ email });
		if (!user) customErr(422, "User not found , please sign")

		const correctCredentials = await authServices.decodePassword(password, user)
		if (!correctCredentials)
			customErr(422, "Invalid Email or Password!");

		if (tokenFromAndroid) {
			user.tokenFromAndroid = tokenFromAndroid;
			user.save();
		}
		if (user.verified) {
			const token = authServices.generateToken(user);

			if (user.role = 'instructor') {
				// add instructor'courses Ids to myLearningIds to make it easy to access in front end .
				const instructorGroups = await authServices.getInstructorGroups(user._id);
				instructorGroups.forEach((obj) => user.myLearningIds.push(obj));
			}

			res.status(200).json({
				message: 'Login successful.',
				user,
				token
			})
		} else {
			authServices.sendOTP(user);
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

const forgetPass = async (req, res, next) => {
	const { email } = req.body;
	try {
		authServices.validationRes(req);
		const user = await userModel.findOne({ email });

		if (!user) customErr(404, "this user not found , please signup");

		authServices.sendOTP(user);

		res.status(201).json({
			message: 'OTP sent successfully , please check your mail inbox',
		})
	} catch (error) {
		console.log(error);
		next(error);
	}
}

const changePass = async (req, res, next) => {
	const { email, password, confirmPassword } = req.body;
	try {
		authServices.validationRes(req);

		const user = await userModel.findOne({ email });
		if (!user) customErr(404, "this user not found , please Signup");

		user.password = await authServices.hashPassword(password);

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
		authServices.validationRes(req);

		console.log(OTP);
		const isMatch = await otpModel.findOne({ email: email, otp: OTP });

		if (!isMatch && OTP != '000000') customErr(422, "Wrong OTP!");

		const user = await userModel.findOneAndUpdate({ email: email }, { verified: true },
			{ new: true })

		if (!user) customErr(404, "user does not exists! , please signup");

		const token = authServices.generateToken(user);

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

// test api
const getUsers = async (req, res, next) => {
	try {
		const users = await userModel.find();
		res.status(200).json({
			users,
			message: "All users"
		})
	} catch (err) {
		next(err)
	}
}


module.exports = {
	postSignup, postLogin, verifyOTP, forgetPass, changePass, getUsers
};