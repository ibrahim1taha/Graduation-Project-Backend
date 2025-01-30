const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const courseModel = require('../models/courses');
const sessionsModel = require('../models/sessions');
const { validationResult } = require('express-validator');
const customErr = require('../utils/customErr');

const courseDocIgnoredItems = {
	trainees: 0, sessions: 0, _id: 0, createdAt: 0
	, updatedAt: 0, enrollmentCount: 0, courseCode: 0
}

class CourseServices {
	static async validateRequest(req) {
		const validationErr = validationResult(req).array();
		console.log(`validationErr : ${validationErr}`);
		if (validationErr.length > 0) customErr(422, validationErr);
	}

	static async handleFileUploaded(file) {

		let imageURl = 'image/defaultImage.jpg';
		let uploadDir, fileName, filePath;

		if (!file) return imageURl;

		if (file.size > 1024 * 1024) {
			throw new customErr(422, [{ "path": "image", msg: 'The image is too large' }]);
		}

		uploadDir = path.join(__dirname, '../public/images');
		fileName = uuidv4() + file.originalname;
		filePath = path.join(uploadDir, fileName);
		imageURl = 'image/' + fileName;
		await fs.promises.writeFile(filePath, file.buffer);

		return imageURl;
	}

	static async createSessions(courseId, sessions) {
		if (!Array.isArray(sessions) || sessions.length === 0) {
			return;
		}
		const sessionsPromises = sessions.map(session => {
			sessionsModel.create({ course: courseId, title: session.title, startDate: session.startDate })
		})
		await Promise.all(sessionsPromises);
	}

	static async getCourses(query, sortOption, limit) {
		const Courses = await courseModel.find(query, courseDocIgnoredItems)
			.populate('instructor', 'userPhoto userName')
			.sort(sortOption)
			.limit(limit);
		if (!Courses || Courses.length === 0) customErr(404, 'something went wrong , no courses found!');
		return Courses;
	}


	static async getCoursesGroupedByTopic() {
		const topics = await courseModel.aggregate()
			.sort({ enrollmentCount: -1, createdAt: -1 })
			.lookup({
				from: 'users',
				localField: 'instructor',
				foreignField: "_id",
				as: "instructor"
			})
			.unwind("instructor")
			.project({
				image: 1, title: 1, price: 1, topic: 1, level: 1,
				instructor: {
					userPhoto: "$instructor.userPhoto",
					userName: "$instructor.userName"
				}
			})
			.group({
				_id: "$topic",
				courses: {
					$push: {
						image: "$image", title: "$title", price: "$price",
						topic: "$topic", level: "$level", instructor: "$instructor"
					},
				}
			}).project({
				_id: 0,
				topic: "$_id",
				courses: { $slice: ["$courses", 5] }
			})
		return topics
	}
}


module.exports = CourseServices; 