const express = require('express');
const router = express.Router();
const isAuth = require('../middlewares/isAuth');

const courseController = require('../controllers/courseController');

// create course
router.post('/addCourse', isAuth.authorized, isAuth.isInstructor, courseController.addCourse);

// get courses 


module.exports = router; 