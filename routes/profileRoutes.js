const express = require('express');

const router = express.Router();
const isAuth = require('../middlewares/isAuth');
const uploaded = require('../middlewares/fileUploaded');
const profileController = require('../controllers/profileController');

// get profile 
router.get('/me', isAuth.authorized, profileController.getMyProfile)
// get instructor Profile (image , name , bio , his courses)
router.get('/instructor/:instructorId', profileController.getInstructorProfile);
// edit profile data (without the image)
router.put('/updateProfile', isAuth.authorized, profileController.updateProfile);
// upload profile photo (as single request) ;
router.put('/uploadUserPhoto', isAuth.authorized,
	uploaded.single('userPhoto'),
	profileController.UploadUserProfilePhoto
);
// delete User Profile Photo
router.delete('/delUserPhoto', isAuth.authorized, profileController.delUserProfilePhoto);
// delete account (courses , groups , delete group session) 
router.delete('/deleteAccount', isAuth.authorized, profileController.deleteUserAcc)

module.exports = router; 