const mongoose = require('mongoose');
// const User = require('./userModel');
// const validator = require('validator');

const rankingSchema = new mongoose.Schema(
  {
    rank : {
        type: Number,
        default : -1
    },
    score: {
      type: mongoose.Schema.ObjectId,
      ref: 'Score',
      required: [true, 'Progress learning must belong to a User!']
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

const Ranking = mongoose.model('Ranking', rankingSchema);

module.exports = Ranking;
