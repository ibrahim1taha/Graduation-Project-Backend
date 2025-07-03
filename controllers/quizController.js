const apiKey = "AIzaSyDoFaKAnYPITG8BaILlkXCgewtrRs14-ZQ";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
////////////////////////////////////////////////////////////

const QuizServices = require("../services/quizServices");
const CourseServices = require("../services/courseServices");
const userModel = require('../models/users'); 
const customErr = require("../utils/customErr");
class QuizController {
    static async generateQuiz(req, res, next) {
        const { title, courseId } = req.body;
        const { sessionId } = req.params;
        
        try {
            // don't forget to add validation for summary text
            QuizServices.validateQuizGeneration(title, courseId, sessionId);
            await CourseServices.isJoinedCourse(courseId, req.userId);

            const session = await QuizServices.validateSession(sessionId);
			const content = await QuizServices.handleArticleContent(session.articleId);
			
            const output = await QuizServices.callAIService(content, URL);
            const questionsFormatted = QuizServices.parseAndFormatQuestions(output);

            const quiz = await QuizServices.createQuiz(title, courseId, sessionId, questionsFormatted);
		
            await QuizServices.updateSession(session , quiz._id);

            res.status(201).json({
                success: true,
				quizId : quiz._id, 
                message: "Quiz generated successfully!",
            });
        } catch (err) {
            console.log(err);
            next(err);
        }
    }

    static async submitQuiz(req, res, next) {
        const { answers } = req.body;
        const { quizId } = req.params;
		const userId = req.userId;
        
        try {
            const user = await userModel.findById(userId); 
			if(!user) customErr(404, 'User not found!'); 

            const quiz = await QuizServices.validateSubmission(quizId, answers, userId);
            await CourseServices.isJoinedCourse(quiz.courseId, userId);

            const { score, formattedAnswers } = QuizServices.processAndScoreAnswers(answers, quiz);
            
            await QuizServices.createSubmission(userId, user.userName, user.userPhoto , quizId, quiz, formattedAnswers, score);

            res.status(201).json({
                success: true,
                message: "Quiz submitted successfully",
            });
        } catch (err) {
            console.log(err);
            next(err);
        }
    }

    static async getQuizzesList(req, res, next) {
        const { courseId } = req.params;
        
        try {
            await CourseServices.isJoinedCourse(courseId, req.userId);

            const sessions = await QuizServices.getAvailableSessionsForQuiz(courseId, req.userId);
            const quizzes = await QuizServices.getQuizzesByCourse(courseId);

            res.status(200).json({
                quizzes,
                sessions,
            });
        } catch (err) {
            console.log(err);
            next(err);
        }
    }

    static async getOneQuiz(req, res, next) {
        const { quizId , userId} = req.params;
        try {
            const { quiz } = await QuizServices.validateQuizAccess(quizId, userId);
            await CourseServices.isJoinedCourse(quiz.courseId, userId);

            const submission = await QuizServices.getUserSubmission(userId, quizId);

            if (submission) {
                const userAnswers = QuizServices.formatUserAnswers(submission, quiz);

                res.status(200).json({
                    isSubmitted: true,
                    userAnswers,
                    totalPointsEarned: submission.totalPointsEarned,
                    totalPointsPossible: submission.totalPointsPossible,
                });
            } else {
                res.status(200).json({ isSubmitted: false, quiz });
            }
        } catch (err) {
            console.log(err);
            next(err);
        }
    }

	static async getQuizSubmissions(req ,res , next){
		const {quizId} = req.params ;
		try {
			const submissions = await QuizServices.getUsersSubmissions(quizId);
			res.status(200).json(submissions);
		} catch (err) {
			console.log(err); 
			next(err) ; 
		}
	}
}

module.exports = QuizController;


