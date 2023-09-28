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


async function getExam(req, res) {
    try {
        const exam = await Exam.findOne().populate({ path: 'questions' });
        
        if (!exam) {
            return res.status(404).json({
                status: 'error',
                message: 'No document found with that ID',
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                exam,
            },
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
}

exports.checkWhichUserHasPlayed = catchAsync(async (req, res, next) => {
    try {
        const s = await Score.findOne({ userId: req.params.userId });

        if (!s) {
            // Gọi hàm getExam và trả về kết quả từ hàm đó
            return await getExam(req, res);
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: s,
            },
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
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

    s = await Score.create({
        userName: req.body.userName,
        phone : req.body.phone,
        userId: req.body.userId,
        exam: exam,
        highestScore: score,
        scores: score,
        timeAnswers: req.body.timeAnswer,
        answerAts: currentTime
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


exports.quizRankings = catchAsync(async (req, res, next) => {
    console.log('xxxxxxxxxxxxx')
    const scores = await Score.find();
   

    scores.sort((a, b) => {
        if (a.highestScore !== b.highestScore) {
            return b.highestScore - a.highestScore; // Sắp xếp theo highestScore giảm dần
        } else if (a.timeAnswers !== b.timeAnswers) {
            return a.timeAnswers - b.timeAnswers; // Nếu highestScore bằng nhau, sắp xếp theo timeAnswers tăng dần
        } else {
            // So sánh theo thời gian answerAts (tăng dần)
            return new Date(a.answerAts) - new Date(b.answerAts);
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            data: scores,
        },
    });
});
