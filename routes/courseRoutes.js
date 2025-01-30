const express = require('express');
const router = express.Router();
const isAuth = require('../middlewares/isAuth');
const uploaded = require('../middlewares/fileUploaded');

const courseController = require('../controllers/courseController');
const courseValidators = require('../validations/courseValidators');
// /addCourse
router.post('/addCourse', isAuth.authorized, isAuth.isInstructor
	, uploaded.single('image')
	, courseValidators.courseValidations
	, courseController.addCourse);

// get HOME API 
router.get('/popular', courseController.getPopularCourses);
router.get('/new', courseController.getNewCourses);
router.get('/topics', courseController.getCoursesWithTopics);


module.exports = router; 