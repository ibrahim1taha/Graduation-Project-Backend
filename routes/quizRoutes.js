const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const QuizController = require("../controllers/quizController");

router.post(
    "/:sessionId/generate",
    isAuth.authorized,
    QuizController.generateQuiz
);
router.post("/:quizId/submit", isAuth.authorized, QuizController.submitQuiz);

router.get(
    "/:courseId/quizzes-list",
    isAuth.authorized,
    QuizController.getQuizzesList
);


// get one quiz
router.get("/questions/:quizId/:userId", isAuth.authorized, QuizController.getOneQuiz);

// get quiz submissions
router.get("/submissions/:quizId", isAuth.authorized , QuizController.getQuizSubmissions);

module.exports = router;
