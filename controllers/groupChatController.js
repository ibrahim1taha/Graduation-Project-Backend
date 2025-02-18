const customErr = require('../utils/customErr');
const groupsModel = require('../models/groups');
const messageModel = require('../models/messages');
const userModel = require('../models/users');
const awsFileHandler = require('../utils/awsFileHandler');

class chatGroupsController {
	static async getGroupsLists(req, res, next) {
		try {
			if (!req.userId) customErr(422, 'User must be authorized!')
			const groups = await userModel.aggregate([
				{
					$match: { _id: req.userId }
				},
				{
					$lookup: {
						from: 'groups',
						localField: 'myLearningIds.courseChatGroupId',
						foreignField: '_id',
						as: 'groups'
					}
				},
				{
					$project: { groups: 1 }
				}
			])
			if (!groups) customErr(404, 'No groups found, you must join a course to see its group here!');

			res.status(200).json(groups[0]);
		} catch (err) {
			console.log(err);
			next(err);
		}
	};

	static async getGroupChat(req, res, next) {
		const groupId = req.params.groupId;
		try {

		} catch (err) {
			console.log(err);
			next();
		}
	};

	static async postSendMsg(req, res, next) {
		const groupId = req.params.groupId;
		const { text } = req.body;
		try {
			let msgImageUrl;
			if (req.file) msgImageUrl = await awsFileHandler.handleFileUploaded(req.file, 'chatImages', 400, null);
			await messageModel.create({
				text: text,
				groupId: groupId,
				sender: req.userId,
				msgImage: msgImageUrl
			})
			res.status(201).json({ message: 'massage sent successfully!' });
		} catch (err) {
			console.log(err);
			next();
		}
	}

}

module.exports = chatGroupsController