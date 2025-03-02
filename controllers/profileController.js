const courseModel = require('../models/courses');
const sessionsModel = require('../models/sessions');
const userModel = require('../models/users');
const groupsModel = require('../models/groups');
const messageModel = require('../models/messages');
const awsFileHandler = require('../utils/awsFileHandler');
const authService = require('../services/authServices');
const customErr = require('../utils/customErr');
const ProfileServices = require('../services/profileServices');
const { default: mongoose } = require('mongoose');

const defaultPhoto = 'https://grad-proj-images.s3.eu-north-1.amazonaws.com/profile/defaultProfile.png';
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
	// get instructor with his course -> should be get this page if click on instructor name in any place
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
		let { userName, bio, role } = req.body;
		try {
			if (!req.userId) customErr(500, 'User id lost!')

			if (role === 'trainee' && req.userRole === 'instructor')
				customErr(404, 'Sorry, Instructor account can not be trainee account');

			const updatedUser = await userModel.findByIdAndUpdate(req.userId, {
				userName: userName,
				bio: bio,
				role: role
			}, { new: true, select: '-myLearningIds -password' });

			if (!updatedUser) customErr(404, 'Failed to update profile , User not found!');
			console.log(updatedUser);
			const newToken = authService.generateToken(updatedUser);

			res.status(201).json({
				success: true,
				message: 'Profile updated successfully!',
				updatedUser,
				token: newToken
			})

		} catch (err) {
			console.log(err);
			next(err);
		}
	};

	static async UploadUserProfilePhoto(req, res, next) {
		const session = await mongoose.startSession()
		try {
			await session.withTransaction(async () => {
				if (!req.userId) customErr(404, 'Can not update profile photo , User not found!');
				if (!req.file) customErr(500, 'file missed');

				const userPhoto = await awsFileHandler.handleFileUploaded(req.file, 'profile', 300, 300);
				if (!userPhoto) customErr(500, 'file missed');

				const user = await userModel.findById(req.userId, { myLearningIds: 0, password: 0 })
				if (!user) customErr(404, 'Upload profile photo failed , user not found!');

				if (user.userPhoto && user.userPhoto !== defaultPhoto)
					await awsFileHandler.deleteImageFromS3(user.userPhoto);

				user.userPhoto = userPhoto;
				await user.save();

				res.status(201).json({
					success: true,
					message: 'Profile photo uploaded successfully!',
					user
				})
			})
		} catch (err) {
			console.log(err);
			next(err);
		} finally {
			session.endSession();
		}
	}

	static async delUserProfilePhoto(req, res, next) {
		try {
			if (!req.userId) customErr(404, 'Can not update profile photo , User not found!');

			const user = await userModel.findById(req.userId, { myLearningIds: 0, password: 0 })

			if (!user) customErr(404, 'Delete profile photo failed , user not found!');

			if (user.userPhoto && user.userPhoto !== defaultPhoto)
				await awsFileHandler.deleteImageFromS3(user.userPhoto);

			user.userPhoto = defaultPhoto;
			await user.save();

			res.status(201).json({
				success: true,
				message: 'Profile photo deleted successfully!',
				user
			})
		} catch (err) {
			console.log(err);
			next(err);
		}

	}

	static async deleteUserAcc(req, res, next) {
		const session = await mongoose.startSession();
		try {
			await session.withTransaction(async () => {
				if (!req.userId) customErr(500, 'User id lost!');
				if (req.userRole !== 'instructor') {
					const user = await userModel.findByIdAndDelete(req.userId, { session })
					if (user.userPhoto !== defaultPhoto)
						await awsFileHandler.deleteImageFromS3(user.userPhoto);
					return;
				}
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

				const groupsMsgs = await messageModel.find({ groupId: { $in: groupsId } });

				const groupsMsgsIdsArr = groupsMsgs.reduce((groupsIdsArr, msg) => {
					if (msg.msgImage) {
						const url = new URL(msg.msgImage);
						const imageUrl = url.pathname.substring(1);
						groupsIdsArr.push({ Key: imageUrl });
					}
					return groupsIdsArr
				}, []);


				const user = await userModel.findByIdAndDelete(req.userId, { session });
				if (user.userPhoto !== defaultPhoto)
					await awsFileHandler.deleteImageFromS3(user.userPhoto);

				if (groupsMsgsIdsArr.length > 0) await awsFileHandler.deleteImagesFromS3(groupsMsgsIdsArr);
				if (imagesKeys.length > 0) await awsFileHandler.deleteImagesFromS3(imagesKeys);

				await Promise.all([
					sessionsModel.deleteMany({ courseId: { $in: coursesIds } }, { session }),
					messageModel.deleteMany({ groupId: { $in: groupsId } }, { session }),
					groupsModel.deleteMany({ _id: { $in: groupsId } }, { session }),
					courseModel.deleteMany({ _id: { $in: coursesIds } }, { session }),
				])
			})
			res.status(200).json({ success: true, message: 'Account deleted successfully!' })
		} catch (err) {
			console.log(err);
			next(err);
		}
	}

}

module.exports = ProfileController; 