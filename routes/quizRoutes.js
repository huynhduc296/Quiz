const express = require('express');
const quizController = require('../controller/quizController');

const router = express.Router()


router
    .route('/')
    .get(quizController.getExam)
    .post(quizController.createQuiz)



 router
    .route('/calculateScoreExamAndUpdate/:examId')
    .post(quizController.calculateScoreExamAndUpdate)

    

module.exports = router;