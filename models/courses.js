const mongoose = require('mongoose');

const coursesSchema = mongoose.Schema({
	title: {
		type: String, required: true
	}, price: {
		type: Number, required: true
	},
	description: {
		type: String, required: true,
	},
	topic: {
		type: String, required: true,
	},
	level: {
		type: String, enum: {
			values: ['beginner', 'intermediate', 'advanced'],
			message: 'unknown course level'
		},
		required: true
	},
	instructor: {
		type: mongoose.Types.ObjectId, ref: 'users', required: true
	},
	trainees: [{
		type: mongoose.Types.ObjectId, ref: 'users'
	}],
	sessions: [{
		type: mongoose.Types.ObjectId, ref: 'sessions'
	}],

}, { timestamps: true })

coursesSchema.index({ courseLevel: 1 });
coursesSchema.index({ courseTopic: 1 });
coursesSchema.index({ courseName: 1 });

module.exports = mongoose.model('courses', coursesSchema); 