const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const HistorySchema = new Schema({
  scores: {
    type: 'array',
    required: true,
  },

  total_score: {
    type: 'number',
  },

  // Associations
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
  },

  game: {
    type: Schema.Types.ObjectId,
    ref: 'Games',
  },
},
{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
});

HistorySchema.pre('save', function (next) {
  let scores = 0;
  this.scores.map(s => { scores = scores + s.score });
  this.total_score = scores;
  next();
});

module.exports = mongoose.model('History', HistorySchema);