const mongoose = require('mongoose');
const examSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: [true, 'Exam must have a name'],
      },
    passingScore :{
      type : Number,
      default : 15
    },
    description: String,
    questions: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'Question',
          required: [true, 'Exam must have a question!'],
        },
      ],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

examSchema.pre(/^find/, function (next) {
  this.find({ isHidden: { $ne: true } });
  next();
});

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
