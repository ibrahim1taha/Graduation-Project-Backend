const quizModel = require("../models/quiz");
const submissionsModel = require("../models/submissions");
const sessionsModel = require("../models/sessions");
const coursesModel = require("../models/courses");
const articlesModel = require('../models/articles'); 
const customErr = require('../utils/customErr');
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

	static async createArticle (courseId , sessionId , title , Url , readingTime){
		const article = await articlesModel.create({
			courseId : courseId , 
			sessionId : sessionId, 
			title : title ,
			contentUrl : Url , 
			readingTime : readingTime
		})

		return article ;
	}
}

module.exports = SessionsServices; 