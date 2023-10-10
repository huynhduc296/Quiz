const mongoose = require('mongoose');
// const User = require('./userModel');
// const validator = require('validator');

const scoreSchema = new mongoose.Schema(
  {
    userName: {
        type: String,
        required: [true, 'Please tell us combo name!']
    },
    phone :{
        type :Number,
        default: 0
    },
    favoriteGift:{
        type :Number,
        default: 0
    },
    checkCompleted: {
      type : Boolean,
      default : false
    },
    userId:{
        type: String,
        unique: true,
        required: [true, 'Please tell us combo name!']
    },
    exam: {
        type: mongoose.Schema.ObjectId,
        ref: 'Exam',
        required: [true, 'Score must belong to a Exam!']
    },
    highestScore: {
      type: Number,
      default: 0
    },
    scores:
      {
        type: Number,
        default: 0
      },
    timeAnswers: 
      {
        type: Number,
        default: 0
      },
    currentPercent:{
      type: Number,
      default: 0
    },
    answerAts:
      {
        type: Date,
        default: Date.now()
      },
    createdAt: {
      type: Date,
      default: Date.now()
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;
