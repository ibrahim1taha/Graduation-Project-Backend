const sessionsModel = require('../models/sessions');
const customErr = require('../utils/customErr');
const coursesModel = require('../models/courses');
const usersModel = require('../models/users');
const articlesModel = require('../models/articles'); 
const SessionsServices =require('../services/liveSessionServices'); 
const QuizServices = require("../services/quizServices");
const socket = require('../sockets/socket'); 
const FormData = require('form-data');
const axios = require('axios');
class liveSessionController {

	static async joinLiveSession(sessionId, userId, socket, io) {
		try {
			const session = await sessionsModel.findById(sessionId);
			if (!session) return socket.emit('error', 'Session not found!');

			const course = await coursesModel.findById(session.courseId);
			if (!course) return socket.emit('error', 'Course not found!');

			const user = await usersModel.findById(userId, { userId: userId, userName: 1, role: 1 });
			if (!user) return socket.emit('error', 'Course not found!');
			// socket here to change btn status in real time .
			if (course.instructor == userId && session.status !== 'ended-summary') {
				session.status = 'running';
				io.to(course._id.toString()).emit('update-session-status', { sessionId, status: 'running' }); ///////////
			}

			if (!session.attendance.some(obj => obj.userId == userId)){
				session.attendance.push(user);
			}
			
			await session.save();

			socket.broadcast.to(sessionId).emit('user-connected', user); ///////////
			console.log(session.attendance); 
			socket.emit('existing-users', session.attendance);////////////
			
			
		} catch (err) {
			socket.emit('error', 'Can not join the session!');
			console.log(err);
		}
	}

	static async leaveLiveSession(sessionId, userId, socket , role) {
		try {
			const session = await sessionsModel.findById(sessionId);
			if (!session) return socket.emit('error', 'Session not found!');
			
			session.attendance = session.attendance.filter(obj => obj.userId.toString() !== userId);

			if ( role === 'instructor' ) {
				session.status = 'ended-reopen';
			}

			await session.save();
			socket.to(sessionId).emit('one-leaved-session', userId);
		} catch (err) {
			socket.emit('error', 'Can not leave the session!');
			console.log(err);
		}
	}
	// used only with the instructor when press End session btn.
	static async generateSessionSummary(req , res , next){
		const {sessionId} = req.params ;
		const audioFile = req.file ; 
		let sessionStatus ; 
		try {
			const session = await SessionsServices.validateSessionToSummarize(sessionId);
			
			let article ;

			audioFile ? 
			[ article , sessionStatus ] = await SessionsServices.generateArticle(session , audioFile) 
			:
			sessionStatus = 'ended-noSummary'

			const articleId = article ? article._id : null
			await SessionsServices.updateSummarizedSession(session , sessionStatus ,articleId ); 

			// notify that article is now available
			socket.emitToRoom(session.courseId.toString() , 'update-session-status' , {
				sessionId, 
				articleId : articleId ,
				status: sessionStatus
			});

			res.status(201).json({
				success : true ,
				sessionId , 
				articleId : articleId ,
				message : 'Session ended successfully!'
			});
		} catch (err) {
			console.log(err); 
			next(err); 
		}
	}

	static async getArticle (req ,res ,next) {
		const {articleId} = req.params ; 
		try {
			const article = await articlesModel.findById(articleId);
			if(!article) customErr(404 , 'Article not found!'); 

			const content = await QuizServices.handleArticleContent(article._id); 

			res.status(200).json({
				article, 
				content
			})
		} catch (err) {
			console.log(err); 
			next(err); 
		}
	}

	static async handleImagesPrediction(req, res, next) {
		const frame = req.file;
		const { sessionId, userName, userId } = req.body;

		try {
			if (!frame) {
				throw new Error("No file uploaded.");
			}

			const formData = new FormData();
			formData.append('image', frame.buffer, {
				filename: frame.originalname || 'image.jpg',
				contentType: frame.mimetype || 'image/jpeg',
			});
			console.log('yes') ; 
			const response = await axios.post('http://localhost:8000/api/predict-single', formData, {
				headers: formData.getHeaders(),
				maxBodyLength: Infinity,
			});

			console.log('API Response:', response.data);
			res.json(response.data);

			} catch (err) {
				console.error('Error calling API:', err?.response?.data || err.message);
				res.status(500).json({ error: true, message: err?.response?.data || err.message });
			}
	}

	
}

module.exports = liveSessionController; 