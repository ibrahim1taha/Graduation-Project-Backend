const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const coursesSchema = mongoose.Schema({
	image: {
		type: String,
		default: 'image/defaultImage.png'
	},
	title: {
		type: String, required: true
	}, price: {
		type: Number, required: true
	},
	description: {
		type: String, required: true,
	},
	topic: {
		type: String, enum: {
			values: ['software development', 'uiux design', 'cybersecurity', 'cloud computing', 'cloud computing'],
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
	trainees: [{
		type: mongoose.Schema.Types.ObjectId, ref: 'Users'
	}],
	sessions: [{
		type: mongoose.Schema.Types.ObjectId, ref: 'sessions'
	}],
	enrollmentCount: {
		type: Number,
		default: 0
	},
	courseCode: {
		type: String,
		default: uuidv4(),
	}

}, { timestamps: true })

coursesSchema.index({ courseLevel: 1 });
coursesSchema.index({ courseTopic: 1 });
coursesSchema.index({ courseName: 1 });
coursesSchema.index({ createdAt: -1 });
coursesSchema.index({ enrollmentCount: -1 });
coursesSchema.index({ instructor: 1 });

module.exports = mongoose.model('courses', coursesSchema); 