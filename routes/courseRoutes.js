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
router.delete('/delete/:id', isAuth.authorized, isAuth.isInstructor, courseController.deleteCourses)
// Update course end point 
router.put('/update/:id', isAuth.authorized, isAuth.isInstructor
	, uploaded.single('image')
	, courseValidators.courseValidations
	, courseController.updateCourse);

// many get for HOME API (not in use)
router.get('/popular', courseController.getPopularCourses);
router.get('/new', courseController.getNewCourses);
router.get('/topics', courseController.getCoursesWithTopics);
// single api for Home page 
router.get('/homeDate', courseController.getHomeData);


// test api --- delete all courses with there images 
// router.delete('/deleteAll/testApiWithIbrahimTaha', courseController.dltAllCoursesWithImgs)
module.exports = router; 