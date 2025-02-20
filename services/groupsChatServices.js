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
				$unwind: '$groups'
			},
			{
				$lookup: {
					from: 'users',
					localField: 'groups.instructor',
					foreignField: '_id',
					as: 'groups.instructorDetails'
				}
			},
			{
				$unwind: '$groups.instructorDetails'
			},
			{
				$addFields: {
					'groups.instructor': {
						_id: '$groups.instructorDetails._id',
						userName: '$groups.instructorDetails.userName',
					}
				}
			},
			{
				$group: {
					_id: '$_id',
					groups: { $push: '$groups' }
				}
			},
			{
				$project: {
					groups: {
						_id: 1,
						groupImage: 1,
						groupName: 1,
						course: 1,
						instructor: 1,
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


	static async getInstructorGroups(id) {
		return await groupsModel.aggregate([
			{
				$match: { instructor: id }
			},
			{
				$lookup: {
					from: 'users',
					localField: 'instructor',
					foreignField: '_id',
					as: 'instructor'
				}
			},
			{ $unwind: '$instructor' },
			{
				$project: {
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
		])
	}
}

module.exports = groupsChatServices; 