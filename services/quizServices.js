const axios = require("axios");
const { ObjectId } = require("mongodb");
const quizModel = require("../models/quiz");
const submissionsModel = require("../models/submissions");
const sessionsModel = require("../models/sessions");
const coursesModel = require("../models/courses");
const customErr = require("../utils/customErr");

class QuizServices {
    static generatePrompt(summaryText) {
        return `Based on the input text, generate between 4 and 10 multiple-choice questions depending on the content depth. Return them as a JSON array in this format:
[
  {
    "questionTitle": "Question here?",
    "options": [
      { "optionId": "a", "optionText": "Option A" },
      { "optionId": "b", "optionText": "Option B" },
      { "optionId": "c", "optionText": "Option C" },
      { "optionId": "d", "optionText": "Option D" }
    ],
	,
    "correctAnswer": "b"
  }
]

Requirements:
- Each question must have exactly one correct answer
- Provide exactly 4 options (a, b, c, d) for each question
- Questions should test understanding, application, and analysis - not just memorization
- Include a mix of question types: factual recall, conceptual understanding, and application
- Make incorrect options plausible but clearly wrong to knowledgeable readers
- Avoid ambiguous wording and "all of the above" or "none of the above" options
- Ensure questions cover different parts of the content, not just the beginning
- Use clear, concise language appropriate for the subject level
- Return only valid JSON without any additional text or formatting

Text:
"""${summaryText}"""`;
    }

    static async validateQuizGeneration(title, courseId, sessionId) {
        if (!title || !courseId || !sessionId) {
            customErr(400, "Missing required fields");
        }
    }

    static async validateSession(sessionId) {
        const session = await sessionsModel.findById(sessionId);
        if (!session || session.status !== "ended-summary" || session.isQuiz !== false) {
            customErr(400, "Can not generate quiz for this session!");
        }
        return session;
    }

    static async callAIService(summaryText, URL) {
        const result = await axios.post(URL, {
            contents: [
                { parts: [{ text: QuizServices.generatePrompt(summaryText) }] },
            ],
            generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 2048,
            },
        });

        const output = result.data?.candidates?.[0]?.content?.parts?.[0]?.text || " ";
        if (!output) {
            customErr(400, "Missing required fields");
        }

        return output;
    }

    static parseAndFormatQuestions(output) {
        const cleanedJson = output
            .replace(/^```json\n/, "")
            .replace(/```$/, "")
            .trim();

        const questions = JSON.parse(cleanedJson);

        return questions.map((q) => ({
            ...q,
            questionId: new ObjectId(),
        }));
    }

    static async createQuiz(title, courseId, sessionId, questionsFormatted) {
        return await quizModel.create({
            title: title,
            courseId: courseId,
            sessionId: sessionId,
            questions: questionsFormatted,
        });
    }

    static async updateSessionQuizStatus(session) {
        session.isQuiz = true;
        await session.save();
    }

    static async validateSubmission(quizId, answers, userId) {
        if (!quizId || !Array.isArray(answers)) {
            customErr(400, "Missing required fields!");
        }

        const quiz = await quizModel.findById(quizId);
        if (!quiz) {
            customErr(404, "quiz not found!");
        }

        const existingSubmission = await submissionsModel.findOne({
            quizId,
            userId,
        });
        if (existingSubmission) {
            customErr(400, "Quiz already submitted");
        }

        return quiz;
    }

    static processAndScoreAnswers(answers, quiz) {
        let score = 0;
        const formattedAnswers = [];

        for (const ans of answers) {
            const question = quiz.questions.find(
                (q) => q.questionId.toString() === ans.questionId.toString()
            );
            if (!question) {
                customErr(404, "answered question not found in quiz!");
            }

            const isCorrect = ans.answer === question.correctAnswer;
            score += isCorrect ? 1 : 0;

            formattedAnswers.push({
                questionId: ans.questionId,
                answer: ans.answer,
                isCorrect: isCorrect,
            });
        }

        return { score, formattedAnswers };
    }

    static async createSubmission(userId, quizId, quiz, formattedAnswers, score) {
        return await submissionsModel.create({
            userId,
            quizId,
            sessionId: quiz.sessionId,
            courseId: quiz.courseId,
            answers: formattedAnswers,
            totalPointsEarned: score,
            totalPointsPossible: quiz.questions.length,
        });
    }

    static async getQuizzesByCourse(courseId) {
        return await quizModel
            .find({ courseId })
            .select(" -questions ");
    }

    static async getAvailableSessionsForQuiz(courseId, userId) {
        const course = await coursesModel.findById(courseId);
        let sessions;
        if (course.instructor.toString() === userId.toString()) {
            sessions = await sessionsModel
                .find({
                    courseId,
                    status: "ended-summary",
                    isQuiz: { $in: [false, undefined] },
                })
                .select(" -attendance  ");
        }
        return sessions ;
    }

    static async validateQuizAccess(quizId, userId) {
        const quiz = await quizModel.findById(quizId);
        if (!quiz) {
            customErr(404, "Quiz not found!");
        }

        const course = await coursesModel.findById(quiz.courseId);
        if (!course) {
            customErr(404, "The course of this quiz not found!");
        }

        return { quiz, course };
    }

    static async getUserSubmission(userId, quizId) {
        return await submissionsModel.findOne({
            userId: userId,
            quizId,
        });
    }

    static async getUsersSubmissions(quizId) {
        const submissions = await submissionsModel.find({ quizId }).select(' -answers ');
		if(!submissions || submissions.length == 0) customErr(404, 'No submissions yet!') ; 
		return submissions; 
    }

    static formatUserAnswers(submission, quiz) {
        const questionsMap = new Map();

        quiz.questions.forEach((q) => {
            questionsMap.set(q.questionId.toString(), q);
        });

        return submission.answers.map((ans) => {
            const question = questionsMap.get(ans.questionId.toString());

            if (!question) {
                customErr(404, `Question not found for ID: ${ans.questionId.toString()}`);
            }

            return {
                questionId: ans.questionId,
                userAnswer: ans.answer,
                isUserAnswerCorrect: ans.isCorrect,
                questionTitle: question.questionTitle,
                options: question.options,
                correctAnswer: question.correctAnswer,
            };
        });
    }
}

module.exports = QuizServices;