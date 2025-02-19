const mongoose = require('mongoose');
const generateRandomCode = require('../utils/generateRandomCode');

const coursesSchema = mongoose.Schema({
	image: {
		type: String,
		// default: 'image/defaultImage.png'
	},
	title: {
		type: String, required: true
	}, price: {
		type: Number, required: true
	},
	description: {
		type: String, required: true,
	},
	chatGroupId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'groups',
		required: true
	},
	topic: {
		type: String, enum: {
			values: ['software-development', 'artificial-intelligence', 'cloud-computing', 'cybersecurity', 'uiux-design'],
			// message: 'Unknown course category'
		}, required: true,
	},
	level: {
		type: String, enum: {
			values: ['beginner', 'intermediate', 'advanced'],
			// message: 'unknown course level'
		},
		required: true
	},
	instructor: {
		type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true
	},
	// trainees: [{
	// 	type: mongoose.Schema.Types.ObjectId, ref: 'Users'
	// }],
	// sessions: [{
	// 	session: { type: mongoose.Schema.Types.ObjectId, ref: 'sessions' }
	// }],
	sessionsCount: {
		type: Number, default: 0
	},
	enrollmentCount: {
		type: Number,
		default: 0
	},
	courseCode: {
		type: String,
		default: generateRandomCode,
		unique: true
	}

}, { timestamps: true })

coursesSchema.index({ level: 1 });
coursesSchema.index({ topic: 1 });
coursesSchema.index({ title: 1 });
coursesSchema.index({ createdAt: -1 });
coursesSchema.index({ enrollmentCount: -1 });
coursesSchema.index({ instructor: 1 });
coursesSchema.index({ title: "text", topic: "text", description: "text" });

module.exports = mongoose.model('courses', coursesSchema); 