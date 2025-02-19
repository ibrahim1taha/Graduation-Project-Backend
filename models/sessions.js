const mongoose = require('mongoose');

const sessionsSchema = mongoose.Schema({
	courseId: {
		type: mongoose.Types.ObjectId, ref: 'courses', required: true
	},

	title: { type: String, required: true },

	startDate: { type: Date, required: true },

	status: {
		type: String,
		enum: {
			values: ['scheduled', 'ready', 'running', 'ended']
		},
		default: 'scheduled'
	},
	attendance: [{ type: mongoose.Types.ObjectId, ref: 'Users' }],

}, { timestamps: true })

sessionsSchema.index({ courseId: 1 });


module.exports = mongoose.model('sessions', sessionsSchema);