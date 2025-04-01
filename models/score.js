const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'scores',
    required: true
  },
  classifications: [{
    status: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: true
    },
    minScore: {
      type: Number,
      required: true
    },
    maxScore: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Score', ScoreSchema);