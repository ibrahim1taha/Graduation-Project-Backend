const courseModel = require('../models/courses');
const sessionsModel = require('../models/sessions');
const userModel = require('../models/users');
const groupsModel = require('../models/groups');
const awsFileHandler = require('../utils/awsFileHandler');
const customErr = require('../utils/customErr');

class ProfileServices {
	static async getUser(userId) {
		const profile = await userModel.findById(userId, { password: 0, myLearningIds: 0 });
		if (!profile) customErr(404, 'User not found!');
		return profile;
	}

	static async getInstructorCourses(userId) {
		const courses = await courseModel.find({ instructor: userId });
		if (!courses) customErr(404, 'Instructor does not have courses yet!');

		return courses;
	}

}

module.exports = ProfileServices; 