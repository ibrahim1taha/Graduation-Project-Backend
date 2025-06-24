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
			
			// socket here to change btn status in real time
			// this should replaced with endAndSummarize end point
			// if (action === 'instructor-end-liveSession') {
				// 	// session.attendance = [];
				// 	session.status = 'ended-summary';
				// 	// io.to(session.courseId.toString()).emit('update-session-status', { sessionId, status: 'ended-summary' });
				// }
				
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
		try {
			if(!audioFile) customErr(404, 'The audio file missed!') ; 

			const session = await SessionsServices.validateSessionToSummarize(sessionId); 
			// audio to -> transcript to -> article
			const parsedArticle = await audioToTxt(audioFile); 
			
			const contentURL = await awsFileHandler.handleFileUploaded('audio' , parsedArticle.content ,'articles' )

			const article = await SessionsServices.createArticle(session.courseId ,
				session._id , parsedArticle.title , contentURL , parsedArticle.readingTime);
			
			await SessionsServices.updateSummarizedSession(session , 'ended-summary' , article._id); 

			// notify that article is now available
			socket.emitToRoom(session.courseId.toString() , 'update-session-status' , { 
				sessionId, 
				articleId : article._id ,
				status: 'ended-summary' 
			}) ; 

			res.status(201).json({
				success : true ,
				sessionId , 
				articleId : article._id ,
				message : 'Article summary created successfully!'
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