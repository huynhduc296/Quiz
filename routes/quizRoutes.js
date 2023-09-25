const express = require('express');
const quizController = require('../controller/quizController');

const router = express.Router()


router
    .route('/')
    // .get(quizController.getExam)
    .post(quizController.createQuiz)
router
    .route('/:userId')
    // .get(quizController.getExam)
    .get(quizController.checkWhichUserHasPlayed)
    

 router
    .route('/calculateScoreExamAndUpdate/:examId')
    .post(quizController.calculateScoreExamAndUpdate)

router
    .route('/quizRankings')
    .get(quizController.quizRankings)
    

module.exports = router;