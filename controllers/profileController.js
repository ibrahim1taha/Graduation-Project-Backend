const courseModel = require('../models/courses');
const sessionsModel = require('../models/sessions');
const userModel = require('../models/users');
const groupsModel = require('../models/groups');
const messageModel = require('../models/messages');

const awsFileHandler = require('../utils/awsFileHandler');

const customErr = require('../utils/customErr');
const ProfileServices = require('../services/profileServices');
class ProfileController {
	static async getMyProfile(req, res, next) {
		try {
			const profile = await ProfileServices.getUser(req.userId)

			if (!profile) customErr(404, 'User not found!');

			res.status(200).json(profile);
		} catch (err) {
			console.log(err);
			next(err);
		}
	}

	static async getInstructorProfile(req, res, next) {
		const userId = req.params.instructorId
		try {
			if (!userId) customErr(404, 'User not found!');
			const [profile, courses] = await Promise.all([
				ProfileServices.getUser(userId),
				ProfileServices.getInstructorCourses(userId)
			]);

			res.status(200).json({ profile, courses });
		} catch (err) {
			console.log(err);
			next(err);
		}
	}

	static async updateProfile(req, res, next) {
		let { userPhoto, userName, bio, role } = req.body;
		try {
			if (!req.userId) customErr(500, 'User id lost!')
			if (req.file)
				userPhoto = await awsFileHandler.handleFileUploaded(req.file, 'profile', 300, 300);

			await userModel.findByIdAndUpdate(req.userId, {
				userPhoto: userPhoto,
				userName: userName,
				bio: bio,
				role: role
			});

			res.status(201).json({
				message: 'user profile updated successfully!'
			})
		} catch (err) {
			console.log(err);
			next(err);
		}
	}
	static async deleteUserAcc(req, res, next) {
		try {
			if (!req.userId) customErr(500, 'User id lost!');
			if (req.userRole !== 'instructor') {
				await userModel.findByIdAndDelete(req.userId)
			}
			else {
				const userCourses = await ProfileServices.getInstructorCourses(req.userId);
				const [coursesIds, groupsId, imagesKeys] = userCourses.reduce((
					[coursesIdsArr, groupsIdsArr, imagesKeysArr], course) => {
					const url = new URL(course.image);
					const key = url.pathname.substring(1);
					coursesIdsArr.push(course._id);
					if (key !== 'uploads/defaultImage.png') imagesKeysArr.push({ Key: key });
					groupsIdsArr.push(course.chatGroupId);
					return [coursesIdsArr, groupsIdsArr, imagesKeysArr]
				}, [[], [], []]);

				await Promise.all([
					sessionsModel.deleteMany({ courseId: { $in: coursesIds } }),
					messageModel.deleteMany({ groupId: { $in: groupsId } }),
					groupsModel.deleteMany({ _id: { $in: groupsId } }),
					courseModel.deleteMany({ _id: { $in: coursesIds } }),
					userModel.findByIdAndDelete(req.userId),
					awsFileHandler.deleteImagesFromS3(imagesKeys)
				])
			}
			res.status(200).json({ success: true, message: 'Account deleted successfully' })
		} catch (err) {
			console.log(err);
			next(err);
		}
	}

}

module.exports = ProfileController; 