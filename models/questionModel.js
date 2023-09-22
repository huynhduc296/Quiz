const mongoose = require('mongoose');
// const User = require('./userModel');
// const validator = require('validator');

const questionSchema = new mongoose.Schema(
  {
    question: String,
    answers: [String],
    answerCorrect: Number,
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
