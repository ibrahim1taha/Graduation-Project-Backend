const mongoose = require('mongoose');

const testSchema = mongoose.Schema({
	userName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
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
		default: Date.now()
	}
})

module.exports = mongoose.model('Users', testSchema);