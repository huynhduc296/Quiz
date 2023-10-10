const catchAsync = require("../utils/catchAsync");
const AppError = require("./../utils/appError");
const Question = require("../models/questionModel");
const Exam = require("../models/examModel");
const Score = require("../models/scoreModel");
const Ranking = require("../models/rankingModel");
const CronJob = require("cron").CronJob;

exports.quizRanhkingCronjob = async () => {
  const job = new CronJob(
    "*/30 * * * *",
    async () => {
      try {
        await updateRanhking();
      } catch (error) {
        console.error(error); // Log the error message
        // Do something else if necessary
      }
    },
    null,
    true,
    "Asia/Vientiane"
  );
  job.start();
};

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
    questions: questions,
    passingScore: req.body.passingScore,
  });
  res.status(200).json({
    status: "success",
    data: {
      // exams
    },
  });
});

async function getExam(req, res) {
  try {
    const exam = await Exam.findOne().populate({ path: "questions" });

    if (!exam) {
      return res.status(404).json({
        status: "error",
        message: "No document found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        exam,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
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
      status: "success",
      data: {
        data: s,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

exports.calculateScoreExamAndUpdate = catchAsync(async (req, res, next) => {
  const exam = await Exam.findById(req.params.examId).populate([
    { path: "questions" },
  ]);
  var s = await Score.findOne({ userId: req.body.userId, exam: exam });
  if (s) {
    return next(new AppError("You can only check once ID", 500));
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
    phone: req.body.phone,
    userId: req.body.userId,
    exam: exam,
    highestScore: score,
    scores: score,
    timeAnswers: req.body.timeAnswer,
    answerAts: currentTime,
  });
  if (score >= exam.passingScore) {
    var s = await Score.findByIdAndUpdate(s.id, {
      checkCompleted: true,
    });
  }
  var s = await Score.findOne({ userId: req.body.userId, exam: exam });

  res.status(200).json({
    status: "success",
    data: {
      numberOfSentences: exam.questions.length,
      rightSentence: score,
      userName: req.body.userName,
      checkCompleted: s.checkCompleted,
    },
  });
});

async function updateRanhking() {
  const scores = await Score.find({ checkCompleted: true });
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

  for (var i of scores) {
    const score = await Score.findById(i);
    const ranking = await Ranking.findOne({ score: score });

    const index = scores.indexOf(i) + 1;
    if (!ranking) {
      var s = await Ranking.create({
        score: score,
        rank: index,
      });
    } else {
      if (ranking.rank != index) {
        var s = await Ranking.findByIdAndUpdate(ranking.id, {
          rank: index,
        });
      }
    }
  }
}

exports.quizRankings = catchAsync(async (req, res, next) => {
  const page = req.query.page || 1; // Trang mặc định là trang 1 nếu không có truy vấn
  const limit = req.query.limit || 100; // Số lượng kết quả trên mỗi trang mặc định là 10 nếu không có truy vấn

  const skip = (page - 1) * limit; // Số lượng bản ghi cần bỏ qua

  const scores = await Score.findOne({ userId: req.params.userId });
  const rankingUser = await Ranking.findOne({ score: scores }).populate(
    "score"
  );

  try {
    const totalRecords = await Ranking.countDocuments();

    const ranking = await Ranking.find()
      .populate("score")
      .skip(skip)
      .limit(limit)
      .sort({ rank: 1 });

    res.status(200).json({
      status: "success",
      data: {
        currentRank: rankingUser,
        ranking,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
      },
    });
  } catch (error) {
    next(error);
  }
});

exports.getRankingbyUser = catchAsync(async (req, res, next) => {
  const scores = await Score.findOne({ userId: req.params.userId });
  const ranking = await Ranking.findOne({ score: scores }).populate("score");
  res.status(200).json({
    status: "success",
    data: {
      data: ranking,
    },
  });
});

exports.updateScore = catchAsync(async (req, res, next) => {
  const scores = await Score.findOne({ userId: req.params.userId });
  console.log(scores);
  if (scores.checkCompleted == true) {
    var s = await Score.findByIdAndUpdate(scores.id, {
      userName: req.body.userName,
      phone: req.body.phone,
      favoriteGift: req.body.favoriteGift,
    });
  }
  res.status(200).json({
    status: "success",
    data: {},
  });
});


exports.getAllRanking = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là trang 1
  const limit = parseInt(req.query.limit) || 100; // Số lượng kết quả trên mỗi trang, mặc định là 10

  const skip = (page - 1) * limit; // Số lượng bản ghi cần bỏ qua

  const scores = await Score.find({ checkCompleted: true })
    .skip(skip) // Bỏ qua các bản ghi trước trang hiện tại
    .limit(limit) // Giới hạn số lượng kết quả trên mỗi trang
    .exec();

  const listRank = [];

  for (var i of scores) {
    const ranking = await Ranking.findOne({ score: i }).populate("score");
    listRank.push(ranking);
  }

  res.status(200).json({
    status: "success",
    data: {
      data: listRank,
    },
  });
});
