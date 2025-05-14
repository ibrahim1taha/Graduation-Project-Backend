const customErr = require('../utils/customErr');
const groupsModel = require('../models/groups');
const messageModel = require('../models/messages');
const userModel = require('../models/users');
const awsFileHandler = require('../utils/awsFileHandler');
const io = require('../sockets/socket').getIo();

class groupsChatServices {

	static async getGroupsListForUser(userId) {
		return await userModel.aggregate([
			{
				$match: { _id: userId }
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
				$lookup: {
					from: 'groups',
					localField: '_id',
					foreignField: 'instructor',
					as: 'urGroups'
				}
			},
			{
				$addFields: {
					groupsList: { $concatArrays: ['$groups', '$urGroups'] }
				}
			},
			{
				$unwind: '$groupsList'
			},
			{
				$lookup: {
					from: 'users',
					localField: 'groupsList.instructor',
					foreignField: '_id',
					as: 'groupsList.instructor'
				}
			},
			{
				$unwind: '$groupsList.instructor'
			},
			{
				$group: {
					_id: '$_id',
					groupsList: {
						$push: '$groupsList'
					}
				}
			},
			{
				$project: {
					_id: 0,
					userId: '$_id',
					groupsList: {
						_id: 1,
						groupImage: 1,
						groupName: 1,
						course: 1,
						'instructor._id': 1,
						'instructor.userPhoto': 1,
						'instructor.userName': 1,
						traineeCount: 1,
						trainees: 1,
						__v: 1,
						updatedAt: 1,
						lastMsgTime: 1
					}
				}
			}
		]);
	}

	static async delGroupChat(groupId, transactionsSession) {
		const allMessages = await messageModel.find({ groupId: groupId });

		const imgsUrlArr = allMessages.reduce((Urls, msg) => {
			if (msg.msgImage) {
				const url = new URL(msg.msgImage);
				const key = url.pathname.substring(1);
				Urls.push({ Key: key });
			}

			return Urls;
		}, []);

		await messageModel.deleteMany({ groupId: groupId }, { session: transactionsSession });
		if(imgsUrlArr.length > 0)
			await awsFileHandler.deleteImagesFromS3(imgsUrlArr)
	}

	static async getUsersDeviceToken(groupId, userId) {
		const tokens = await userModel.find({ $and: [{ 'myLearningIds.courseChatGroupId': groupId }, { _id: { $ne: userId } }] },
			{ _id: 0, tokenFromAndroid: 1 }
		);
		const tokensArr = tokens.map(user => user.tokenFromAndroid);
		return tokensArr;
	}

	static async onlineUsersCount(room){
		const onlineUserCount = await io.in(room).fetchSockets(); 
		return onlineUserCount.length;
	}


}

module.exports = groupsChatServices; 