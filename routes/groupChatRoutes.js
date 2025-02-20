const express = require('express');
const router = express.Router();
const isAuth = require('../middlewares/isAuth');
const uploaded = require('../middlewares/fileUploaded');

const groupController = require('../controllers/groupChatController')
// create group for the this course ✅ in add course.
// get groups list for specific user
router.get('/groupsList', isAuth.authorized, groupController.getGroupsLists)

// get chat for specific group // validate how can get this chat 
router.get('/groupChat/:groupId', isAuth.authorized, groupController.getGroupChat)
// Post : send message  
router.post('/sendMessage/:groupId',
	isAuth.authorized,
	uploaded.single('image'),
	groupController.postSendMsg)


module.exports = router; 