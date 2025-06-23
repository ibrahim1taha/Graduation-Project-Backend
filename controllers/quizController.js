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

const tstText = `Stack is a linear data structure that follows LIFO (Last In First Out) Principle, the last element inserted is the first to be popped out. It means both insertion and deletion operations happen at one end only.

What-is-Stack-(1)
LIFO(Last In First Out) Principle
Here are some real world examples of LIFO

Consider a stack of plates. When we add a plate, we add at the top. When we remove, we remove from the top.
A shuttlecock box (or any other box that is closed from one end) is another great real-world example of the LIFO (Last In, First Out) principle where do insertions and removals from the same end.
Representation of Stack Data Structure:
Stack follows LIFO (Last In First Out) Principle so the element which is pushed last is popped first.

Stack-representation-in-Data-Structures-(1)
Types of Stack:
Fixed Size Stack : As the name suggests, a fixed size stack has a fixed size and cannot grow or shrink dynamically. If the stack is full and an attempt is made to add an element to it, an overflow error occurs. If the stack is empty and an attempt is made to remove an element from it, an underflow error occurs.
Dynamic Size Stack : A dynamic size stack can grow or shrink dynamically. When the stack is full, it automatically increases its size to accommodate the new element, and when the stack is empty, it decreases its size. This type of stack is implemented using a linked list, as it allows for easy resizing of the stack.
Basic Operations on Stack:
In order to make manipulations in a stack, there are certain operations provided to us.

push() to insert an element into the stack
pop() to remove an element from the stack
top() Returns the top element of the stack.
isEmpty() returns true if stack is empty else false.
isFull() returns true if the stack is full else false.
To implement stack, we need to maintain reference to the top item.

Push Operation on Stack
Adds an item to the stack. If the stack is full, then it is said to be an Overflow condition.

Algorithm for Push Operation:

Before pushing the element to the stack, we check if the stack is full .
If the stack is full (top == capacity-1) , then Stack Overflows and we cannot insert the element to the stack.
Otherwise, we increment the value of top by 1 (top = top + 1) and the new value is inserted at top position .
The elements can be pushed into the stack till we reach the capacity of the stack.
Push-Operation-in-Stack-(1)
Pop Operation in Stack
Removes an item from the stack. The items are popped in the reversed order in which they are pushed. If the stack is empty, then it is said to be an Underflow condition.

Algorithm for Pop Operation:

Before popping the element from the stack, we check if the stack is empty .
If the stack is empty (top == -1), then Stack Underflows and we cannot remove any element from the stack.
Otherwise, we store the value at top, decrement the value of top by 1 (top = top - 1) and return the stored top value.
Pop-Operation-in-Stack-(1)
Top or Peek Operation on Stack
Returns the top element of the stack.

Algorithm for Top Operation:

Before returning the top element from the stack, we check if the stack is empty.
If the stack is empty (top == -1), we simply print "Stack is empty".
Otherwise, we return the element stored at index = top .
Top-or-Peek-Operation-in-Stack-(1)
isEmpty Operation in Stack Data Structure:
Returns true if the stack is empty, else false.

Algorithm for isEmpty Operation:

Check for the value of top in stack.
If (top == -1), then the stack is empty so return true .
Otherwise, the stack is not empty so return false .
isEmpty-Operation-in-Stack-(1)
isFull Operation in Stack Data Structure:
Returns true if the stack is full, else false.

Algorithm for isFull Operation:

Check for the value of top in stack.
If (top == capacity-1), then the stack is full so return true.
Otherwise, the stack is not full so return false.`;
