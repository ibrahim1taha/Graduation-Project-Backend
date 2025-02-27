const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	userPhoto: {
		type: String,
		default: 'https://grad-proj-images.s3.eu-north-1.amazonaws.com/profile/defaultProfile.png'
	},
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
	myLearningIds: [{
		courseId: { type: mongoose.Types.ObjectId, required: true, ref: 'courses' },
		courseChatGroupId: { type: mongoose.Types.ObjectId, required: true, ref: 'groups' },
		joinedAt: { type: Date, default: Date.now },
	}],
	// tokenFromAndroid: {
	// 	type: String,
	// }

}, { timestamps: true })


userSchema.index({ 'myLearningIds.courseChatGroupId': 1 });

module.exports = mongoose.model('Users', userSchema);