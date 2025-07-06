const express = require('express');
const router = express.Router();
const isAuth = require('../middlewares/isAuth');
const uploaded = require('../middlewares/fileUploaded');
const liveSessionController = require('../controllers/liveSessionController');

// join the session -> update the session status 
// router.put('/join/:sessionId', isAuth.authorized, liveSessionController.joinSession)
// end the session
router.post('/endAndSummarize/:sessionId' ,
	isAuth.authorized ,
	uploaded.single('audioFile') , liveSessionController.generateSessionSummary)


// get session article 
router.get('/article/:articleId' , isAuth.authorized , liveSessionController.getArticle)


router.post('/predict' , uploaded.single('image') , liveSessionController.handleImagesPrediction)


module.exports = router; 