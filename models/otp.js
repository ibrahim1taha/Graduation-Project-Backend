const mongoose = require('mongoose');

const otpSchema = mongoose.Schema({
	email: {
		type: String,
		required: true
	},
	otp: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now,
	}
})

module.exports = mongoose.model("OTPs", otpSchema); 