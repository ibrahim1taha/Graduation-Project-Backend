const courseModel = require('../models/courses');
const sessionsModel = require('../models/sessions');
const customErr = require('../utils/customErr');
const path = require('path');
const CourseServices = require('../services/courseServices');

const courseController = {
	// add course by instructor endPoint 
	addCourse: async (req, res, next) => {
		try {

			CourseServices.validateRequest(req);
			let imageURl = 'image/defaultImage.png'
			if (req.file)
				imageURl = await CourseServices.handleFileUploaded(req.file);

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

	getHomeData: async (req, res, next) => {
		try {
			const homeData = await CourseServices.getHomeDatePipelines();
			if (!homeData) customErr(404, "No courses found!");
			res.status(200).json(homeData[0]);
		} catch (err) {
			next(err);
		}
	},

	deleteCourses: async (req, res, next) => {
		try {
			const id = req.params.id;
			CourseServices.validateObjectId(id);

			const course = await courseModel.findByIdAndDelete({ _id: id });
			if (!course) customErr(404, 'Course not found!');

			const imageID = path.basename(course.image);
			console.log(imageID);

			await CourseServices.deleteCourseImage(imageID);
			res.status(200).json({ message: "course deleted successfully" });

		} catch (err) {
			next(err);
		}
	},

	updateCourse: async (req, res, next) => {
		try {
			CourseServices.validateRequest(req);
			const courseId = req.params.id;
			CourseServices.validateObjectId(courseId);

			let course = await courseModel.findById(courseId);
			if (!course) customErr(404, 'course not found!');

			const oldImageId = path.basename(course.image);

			const { title, price, type, level, description, sessions } = req.body;

			let newImageUrl;
			if (req.file) {
				if (oldImageId != 'defaultImage.png') await CourseServices.deleteCourseImage(oldImageId);
				newImageUrl = await CourseServices.handleFileUploaded(req.file);
				course.image = newImageUrl;
			}
			course.title = title;
			course.price = price;
			course.type = type;
			course.level = level;
			course.description = description;

			await CourseServices.createSessions(courseId, sessions);

			await course.save();

			res.status(201).json({
				message: 'course updated successfully'
			})
		} catch (err) {
			next(err);
		}

	},

	dltAllCoursesWithImgs: async (req, res, next) => {
		try {

			const courses = await courseModel.find({});
			if (!courses) customErr(404, 'Course not found!');

			courses.map(async course => {
				const imageID = path.basename(course.image);
				await courseModel.deleteOne(course._id);
				if (imageID != 'defaultImage.png') await CourseServices.deleteCourseImage(imageID);
			})

			res.status(200).json({ message: "All courses deleted" });

		} catch (err) {
			next(err);
		}
	},
}

module.exports = courseController; 