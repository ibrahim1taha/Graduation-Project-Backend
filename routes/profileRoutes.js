const express = require('express');

const router = express.Router();
const isAuth = require('../middlewares/isAuth');
const uploaded = require('../middlewares/fileUploaded');
const profileController = require('../controllers/profileController');

// get profile 
router.get('/me', isAuth.authorized, profileController.getMyProfile)
// get instructor Profile (image , name , bio , his courses)
router.get('/instructor/:instructorId', profileController.getInstructorProfile);
// edit profile data (upload image)
router.put('/updateProfile', isAuth.authorized,
	uploaded.single('userPhoto'),
	profileController.updateProfile)
// delete account (courses , groups , delete group session) 
router.delete('/deleteAccount', isAuth.authorized, profileController.deleteUserAcc)

module.exports = router; 