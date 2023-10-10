const express = require("express");
const quizController = require("../controller/quizController");

const router = express.Router();

quizController.quizRanhkingCronjob();

router
  .route("/quizRankings/:userId").get(quizController.quizRankings);

router
  .route("/")
  // .get(quizController.getExam)
  .post(quizController.createQuiz);
router
  .route("/:userId")
  // .get(quizController.getExam)
  .get(quizController.checkWhichUserHasPlayed);

router
  .route("/statistical/getAllRanking")
  .get(quizController.getAllRanking);

router
  .route("/calculateScoreExamAndUpdate/:examId")
  .post(quizController.calculateScoreExamAndUpdate);

router.route("/getRankingbyUser/:userId")
  .get(quizController.getRankingbyUser);

router.route("/updateScore/:userId")
  .patch(quizController.updateScore);

module.exports = router;
