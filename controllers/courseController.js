const courseModel = require('../models/courses');
const sessionsModel = require('../models/sessions');
const customErr = require('../utils/customErr');
const path = require('path');
const CourseServices = require('../services/courseServices');
const sharpImage = require('../utils/sharpImage');


const defaultImageUrl = 'https://grad-proj-images.s3.eu-north-1.amazonaws.com/uploads/defaultImage.png';

const courseController = {
	// add course by instructor endPoint 
	addCourse: async (req, res, next) => {
		try {

			CourseServices.validateRequest(req);
			let imageURl = defaultImageUrl
			const { title, price, description, topic, level, sessions } = req.body;

			const course = new courseModel({
				image: '', title: title, price: price, description: description, topic: topic
				, level: level, instructor: req.userId
			})
			await CourseServices.createSessions(course._id, sessions);

			if (req.file) {
				// share image to 800 * 450 px 
				const imageBuffer = await sharpImage(req.file.buffer, 800, 450);
				imageURl = await CourseServices.handleFileUploaded(imageBuffer, req.file.originalname, req.file.mimetype);
			}

			course.image = imageURl;
			await course.save();
			res.status(201).json({
				message: `course created successfully with ${sessions?.length || 0} session added`,
			})

		} catch (err) {
			console.log(err);
			next(err);
		}

	},

	updateCourse: async (req, res, next) => {
		try {
			// handle if the send updated sessions will update the course ;  
			CourseServices.validateRequest(req);
			const courseId = req.params.id;
			CourseServices.validateObjectId(courseId);

			let course = await courseModel.findById(courseId);
			if (!course) customErr(404, 'course not found!');

			const { title, price, type, level, description, sessions } = req.body;

			course.title = title;
			course.price = price;
			course.type = type;
			course.level = level;
			course.description = description;

			await CourseServices.createSessions(course._id, sessions);

			if (req.file) {
				if (course.image != defaultImageUrl)
					await CourseServices.deleteImageFromS3(course.image);

				const imageBuffer = await sharpImage(req.file.buffer, 800, 450)

				course.image = await CourseServices.handleFileUploaded(imageBuffer, req.file.originalname, req.file.mimetype);
			}

			await course.save();

			res.status(201).json({
				message: 'course updated successfully'
			})

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

			// validate the image not the default one 
			if (course.image != defaultImageUrl)
				await CourseServices.deleteImageFromS3(course.image);

			await CourseServices.deleteCourseSessions(course._id);

			res.status(200).json({ message: "course deleted successfully" });

		} catch (err) {
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

	// dltAllCoursesWithImgs: async (req, res, next) => {
	// 	try {

	// 		const courses = await courseModel.find({});
	// 		if (!courses) customErr(404, 'Course not found!');

	// 		courses.map(async course => {
	// 			const imageID = path.basename(course.image);
	// 			await courseModel.deleteOne(course._id);
	// 			if (imageID != 'defaultImage.png') await CourseServices.deleteCourseImage(imageID);
	// 		})

	// 		res.status(200).json({ message: "All courses deleted!" });

	// 	} catch (err) {
	// 		next(err);
	// 	}
	// },
}

module.exports = courseController; 