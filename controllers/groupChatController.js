const customErr = require('../utils/customErr');
const groupsModel = require('../models/groups');
const messageModel = require('../models/messages');
const userModel = require('../models/users');
const awsFileHandler = require('../utils/awsFileHandler');
const io = require('../sockets/socket').getIo();
const groupsChatServices = require('../services/groupsChatServices');
class chatGroupsController {

	static async getGroupsLists(req, res, next) {
		try {

			if (!req.userId) customErr(422, 'User must be authorized!')
			const groups = await groupsChatServices.getGroupsListForUser(req.userId);

			let groupList = (groups ? groups[0].groups : []);

			if (req.userRole === 'instructor') {
				let instructorCoursesGroups = await groupsChatServices.getInstructorGroups(req.userId);
				groupList = groupList.concat(instructorCoursesGroups)
			}

			if (!groupList) customErr(404, 'No groups found, you must join a course to see its group here!');

			res.status(200).json(groupList);

		} catch (err) {
			console.log(err);
			next(err);
		}
	};

	static async getGroupChat(req, res, next) {
		const groupId = req.params.groupId;

		try {
			const groupChat = await messageModel.find({ groupId: groupId }).populate('sender', '_id userPhoto userName')
			if (!groupChat) customErr(404, 'Error 404 , Not Found!');
			res.status(200).json(groupChat);
		} catch (err) {
			console.log(err);
			next();
		}
	};

	static async postSendMsg(req, res, next) {
		const groupId = req.params.groupId;
		const { text, msgFlagId } = req.body;
		try {
			let msgImageUrl;
			if (req.file) msgImageUrl = await awsFileHandler.handleFileUploaded(req.file, 'chatImages', 400, null);
			const message = new messageModel({
				text: text,
				groupId: groupId,
				sender: req.userId,
				msgImage: msgImageUrl
			})

			await message.populate('sender', '_id userPhoto userName');
			await message.save();

			const updatedGroup = await groupsModel.findByIdAndUpdate(
				groupId,
				{ lastMsgTime: Date.now() },
				{ new: true }
			);

			io.to(groupId).emit('sendMsg', {
				msgFlagId: msgFlagId,
				groupId: groupId,
				message: message,
				lastMsgTime: updatedGroup.lastMsgTime
			});

			res.status(201).json({ message: 'massage sent successfully!' });
		} catch (err) {
			console.log(err);
			next();
		}
	}

}

module.exports = chatGroupsController