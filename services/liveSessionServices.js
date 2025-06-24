const quizModel = require("../models/quiz");
const submissionsModel = require("../models/submissions");
const sessionsModel = require("../models/sessions");
const coursesModel = require("../models/courses");
const articlesModel = require('../models/articles'); 
const customErr = require('../utils/customErr');
const audioToTxt = require('../utils/audioToTxt');  
const awsFileHandler = require("../utils/awsFileHandler");
const socket = require('../sockets/socket'); 
class SessionsServices {

	
	static async validateSessionToSummarize(sessionId){
		const session = await sessionsModel.findById(sessionId);
		if(!session) customErr(404 , 'Session not found!') ; 
		if(session.articleId) customErr(422 , 'The session already has an article!'); 
		
		return session ; 
	}
	
	static async updateSummarizedSession(session , status , articleId){
		session.status = status ;
		session.articleId = articleId ; 
		session.attendance = [] ; 
		await session.save();
	}
	
	static async saveArticle (courseId , sessionId , title , Url , readingTime){
		const article = await articlesModel.create({
			courseId : courseId , 
			sessionId : sessionId, 
			title : title ,
			contentUrl : Url , 
			readingTime : readingTime
		})
		
		return article ;
	}

	static async handleNoArticle () {

	}

	static async generateArticle(session , audioFile){
		// audio to -> transcript to -> article
		socket.emitToRoom(session.courseId.toString() , 'update-session-status' , {
			sessionId : session._id, 
			articleId : null ,
			status: 'pending' 
		});

		session.status = 'pending'; 
		await session.save();

		const parsedArticle = await audioToTxt(audioFile); 
		
		const contentURL = await awsFileHandler.handleFileUploaded('audio' , parsedArticle.content ,'articles' )
	
		const article = await SessionsServices.saveArticle(session.courseId ,
			session._id , parsedArticle.title , contentURL , parsedArticle.readingTime);

		return [article , 'ended-summary']  ;
	}
}

module.exports = SessionsServices; 