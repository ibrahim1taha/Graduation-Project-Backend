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
		default: Date.now(),
		expires: 60 * 30, // The document will be automatically deleted after 5 minutes of its creation time
	}
})

module.exports = mongoose.model("OTPs", otpSchema); 