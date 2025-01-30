const courseModel = require('../models/courses');
const sessionsModel = require('../models/sessions');
const customErr = require('../utils/customErr');

const CourseServices = require('../services/courseServices');

const courseController = {
	// add course by instructor endPoint 
	addCourse: async (req, res, next) => {
		try {

			CourseServices.validateRequest(req);
			const imageURl = await CourseServices.handleFileUploaded(req.file);

			const { title, price, description, topic, level, sessions } = req.body;

			const course = await courseModel.create({
				image: imageURl, title: title, price: price, description: description, topic: topic
				, level: level, instructor: req.userId
			})

			await CourseServices.createSessions(course._id, sessions);

			res.status(201).json({
				message: `course created successfully with ${sessions?.length || 0} session added`,
			})

		} catch (err) {
			console.log(err);
			next(err);
		}

	},
	// retrieve home page course grouped by types and "recommended for u" category
	// /courses/popular
	getPopularCourses: async (req, res, next) => {
		try {
			const popCourses = await CourseServices.getCourses({}, { enrollmentCount: -1 }, 5);
			res.status(200).json(popCourses);
		} catch (err) {
			next(err);
		}
	},

	// courses/new 
	getNewCourses: async (req, res, next) => {
		try {
			const newCourses = await CourseServices.getCourses({}, { createdAt: -1 }, 5);
			res.status(200).json(newCourses);
		} catch (err) {
			next(err);
		}
	},

	// courses/topics // get courses grouped by topics 
	getCoursesWithTopics: async (req, res, next) => {
		try {
			const topics = await CourseServices.getCoursesGroupedByTopic();

			if (!topics || topics.length === 0) customErr(404, 'something went wrong , no courses found!');

			res.status(200).json(topics);

		} catch (err) {
			next(err);
		}
	},
}

module.exports = courseController; 