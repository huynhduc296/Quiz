const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const Question = require('../models/questionModel');
const Exam = require('../models/examModel');
const Score = require('../models/scoreModel');

exports.createQuiz = catchAsync(async (req, res, next) => {
    var questions = [];
    for (const question of req.body.questions) {

        const newQuestion = await Question.create({
            question: question.question,
            answers: question.answers,
            answerCorrect: question.answerCorrect,
        });
        questions.push(newQuestion);
    }
    console.log('bbbbbbbbbbbbbbbbbbbbbbb')
    const exams = await Exam.create({
        name: req.body.name,
        description: req.body.description,
        questions: questions
    });
    res.status(200).json({
        status: 'success',
        data: {
            // exams
        },
    });
})


exports.getExam = catchAsync(async (req, res, next) => {
    let examQuery = Exam.find().populate({ path: 'questions' });
    const exam = await examQuery;

    if (!exam) {
        return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            exam,
        },
    });
});


exports.calculateScoreExamAndUpdate = catchAsync(async (req, res, next) => {
    const exam = await Exam.findById(req.params.examId).populate([
        { path: 'questions' },
    ]);
    var s = await Score.findOne({ userId: req.body.userId, exam: exam });
    if(s){
        return next(new AppError('You can only check once ID', 500));
    }

    var answersUser = req.body.answers;
    var score = 0;
    var index = 0;
    for (var q of exam.questions) {
        if (q.answerCorrect == answersUser[index]) score++;
        index++;
    }
    var currentTime = Date.now();

    var sc = [];
    sc.push(score);
    var time = [];
    time.push(req.body.timeAnswer);
    var ans = [];
    ans.push(currentTime);
    s = await Score.create({
        userName: req.body.userName,
        phone : req.body.phone,
        userId: req.body.userId,
        exam: exam,
        highestScore: score,
        scores: sc,
        timeAnswers: time,
        answerAts: ans
    })
    var s = await Score.findOne({ userId: req.body.userId, exam: exam });
    res.status(200).json({
        status: 'success',
        data: {
            numberOfSentences : exam.questions.length,
            rightSentence : score,
            userName : req.body.userName
        },
    });
});

