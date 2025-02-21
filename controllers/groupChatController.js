const customErr = require('../utils/customErr');
const groupsModel = require('../models/groups');
const messageModel = require('../models/messages');
const userModel = require('../models/users');
const awsFileHandler = require('../utils/awsFileHandler');
const io = require('../sockets/socket').getIo();
const groupsChatServices = require('../services/groupsChatServices');
const mongoose = require('mongoose');
class chatGroupsController {

	static async getGroupsLists(req, res, next) {
		try {

			if (!req.userId) customErr(422, 'User must be authorized!')
			const groupList = await groupsChatServices.getGroupsListForUser(req.userId);

			if (!groupList) customErr(404, 'No groups found, you must join a course to see its group here!');

			res.status(200).json(groupList[0]);

		} catch (err) {
			console.log(err);
			next(err);
		}
	};

	static async getGroupChat(req, res, next) {
		const groupId = req.params.groupId;
		let idx = req.query.index || 0;
		try {
			const isInGroup = await userModel.findOne({
				$and: [{ _id: req.userId }, { 'myLearningIds.courseChatGroupId': groupId }]
			}, { _id: 1 });
			const group = await groupsModel.findById(groupId);
			if (!group) customErr(404, 'Group not found!')
			if (!isInGroup && req.userId.toString() != group.instructor.toString())
				customErr(422, 'Not authorized to access this chat!');

			const groupChat = await messageModel.find({ groupId: groupId }).populate('sender', '_id userPhoto userName');

			const paginatedChat = groupChat.slice(idx, idx + 21);
			if (!groupChat) {
				customErr(404, 'No messages found in this group chat.');
			}

			res.status(200).json(paginatedChat);
		} catch (err) {
			console.log(err);
			next(err);
		}
	};

	static async postSendMsg(req, res, next) {
		const groupId = req.params.groupId;
		const { text, msgFlagId } = req.body;
		const session = await mongoose.startSession();
		session.startTransaction();
		try {

			if (!text || text.trim().length === 0) {
				customErr(400, 'Message text cannot be empty.');
			}

			const group = await groupsModel.findById(groupId);

			if (!group) {
				customErr(404, 'The message group is missing!');
			}

			const isInGroup = await userModel.findOne(
				{ _id: req.userId, 'myLearningIds.courseChatGroupId': groupId },
				{ _id: 1 }
			);

			if (!isInGroup && req.userId.toString() != group.instructor.toString()) {
				customErr(403, 'You are not authorized to send messages in this chat.');
			}

			let msgImageUrl;
			if (req.file) msgImageUrl = await awsFileHandler.handleFileUploaded(req.file, 'chatImages', 400, null);
			const message = new messageModel({
				text: text,
				groupId: groupId,
				sender: req.userId,
				msgImage: msgImageUrl
			})

			group.lastMsgTime = Date.now();

			await message.populate('sender', '_id userPhoto userName');

			await Promise.all([
				message.save({ session }),
				group.save({ session })
			])

			await session.commitTransaction()
			io.to(groupId).emit('sendMsg', {
				msgFlagId: msgFlagId,
				groupId: groupId,
				message: message,
				lastMsgTime: group.lastMsgTime
			});

			res.status(201).json({ message: 'massage sent successfully!' });
		} catch (err) {
			console.log(err);
			await session.abortTransaction();
			next(err);
		} finally {
			session.endSession();
		}
	}

}

module.exports = chatGroupsController