const express = require('express');
const quizController = require('../controller/quizController');

const router = express.Router()

quizController.quizRanhkingCronjob();

router
    .route('/quizRankings')
    .get(quizController.quizRankings)

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
    .route('/updateScore/:userId')
    .patch(quizController.updateScore)

    

module.exports = router;