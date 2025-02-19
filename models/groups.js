const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const groupsSchema = mongoose.Schema({
	groupImage: {
		type: String,
		required: true
	},
	groupName: {
		type: String,
		required: true
	},
	course: {
		type: ObjectId
	},
	instructor: {
		type: ObjectId
	},
	traineeCount: {
		type: Number,
		default: 0
	},
	trainees: [{
		type: ObjectId,
		ref: 'users'
	}],
	// lastMsg: {
	// 	text: String,
	// 	sender: ObjectId,
	// 	time: Date
	// }
}, { timestamp: true });


groupsSchema.index({ course: 1 });
groupsSchema.index({ instructor: 1 });


module.exports = mongoose.model('groups', groupsSchema);

