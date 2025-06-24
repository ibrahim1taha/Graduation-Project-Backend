const sessionsModel = require('../models/sessions');
const customErr = require('../utils/customErr');

const coursesModel = require('../models/courses');
const usersModel = require('../models/users');

const audioToTxt = require('../utils/audioToTxt');  
const awsFileHandler = require("../utils/awsFileHandler");
const articlesModel = require('../models/articles'); 

const SessionsServices =require('../services/liveSessionServices'); 
const QuizServices = require("../services/quizServices");

const socket = require('../sockets/socket'); 
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
			// generate article 
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
}

module.exports = liveSessionController; 