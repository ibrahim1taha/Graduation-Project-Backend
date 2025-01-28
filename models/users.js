const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	userName: {
		type: String,
		required: true,
	},
	email: {
		type: String,

		required: true,
	},
	verified: {
		type: Boolean,
		default: false,
	},
	role: {
		type: String,
		enum: {
			values: ['instructor', 'trainee'],
			message: 'unknown role it must be instructor or trainee!'
		},
		required: true
	},
	password: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('Users', userSchema);