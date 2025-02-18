const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId


const msgSchema = mongoose.Schema({
	text: {
		type: String,
		required: true
	},
	groupId: {
		type: ObjectId,
		required: true,
		ref: 'groups'
	},
	sender: {
		type: ObjectId,
		required: true,
		ref: 'Users'
	},
	msgImage: {
		type: String
	}

}, { timestamp: true });

msgSchema.index({ groupId: 1 });
msgSchema.index({ senderId: 1 });

module.exports = mongoose.model('messages', msgSchema); 