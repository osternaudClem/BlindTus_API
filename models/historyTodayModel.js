const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const HistoryTodaySchema = new Schema({
  attempts: {
    type: 'array',
  },

  isWin: {
    type: 'boolean',
    default: false,
  },

  isCompleted: {
    type: 'boolean',
    default: false,
  },

  // Associations
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
  },

  today: {
    type: Schema.Types.ObjectId,
    ref: 'Today',
  },
},
{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
});

module.exports = mongoose.model('HistoryToday', HistoryTodaySchema);