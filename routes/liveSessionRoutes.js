const express = require('express');
const router = express.Router();
const isAuth = require('../middlewares/isAuth');

const liveSessionController = require('../controllers/liveSessionController');

// join the session -> update the session status 
// router.put('/join/:sessionId', isAuth.authorized, liveSessionController.joinSession)
// end the session

module.exports = router; 