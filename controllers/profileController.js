const courseModel = require('../models/courses');
const sessionsModel = require('../models/sessions');
const userModel = require('../models/users');
const groupsModel = require('../models/groups');
const messageModel = require('../models/messages');

const awsFileHandler = require('../utils/awsFileHandler');

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

			res.status(201).json({
				success: true,
				message: 'Profile updated successfully!',
				updatedUser
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