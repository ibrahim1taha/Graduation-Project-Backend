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

// delete course end point 
router.delete('/delete/:id',
	isAuth.authorized, isAuth.isInstructor,
	courseController.deleteCourses)
// Update course end point 
router.put('/update/:id', isAuth.authorized, isAuth.isInstructor
	, uploaded.single('image')
	, courseValidators.courseValidations
	, courseController.updateCourse);

// many get for HOME API (not in use)
// router.get('/popular', courseController.getPopularCourses);
// router.get('/new', courseController.getNewCourses);
// router.get('/topics', courseController.getCoursesWithTopics);

// single api for Home page 
router.get('/homeDate', courseController.getHomeData);

// course details -> courses/getCourseDetails
router.get('/courseDetails/:courseId', isAuth.authorizedOrNot, courseController.getCourseDetails);

//get topic after click see all from home page , 
router.get('/topic/:topic', courseController.getTopicCourses);

// courses/MyCourses
router.get('/MyCourses',
	isAuth.authorized, isAuth.isInstructor,
	courseController.getMyCourses);

// courses/MyLearning
router.get('/MyLearning',
	isAuth.authorized,
	courseController.getMyLearning);

////////////////////////// about joining course and start sessions /////////////////////////////
// join course 
router.post('/join/:courseId', isAuth.authorized, courseController.joinCourse);



// general routes 

router.get('/search', courseController.searchCourses)

// test api --- delete all courses with there images
// router.delete('/deleteAll/testApi', courseController.dltAllCoursesWithImgs)
module.exports = router; 