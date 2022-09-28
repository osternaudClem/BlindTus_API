const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GamesSchema = new Schema({
  round_time: {
    type: 'number',
    required: true,
  },

  difficulty: {
    type: 'string',
    required: true,
  },

  code: {
    type: 'string',
    required: true,
    unique: true,
  },

  // Associations
  musics: [{
    type: Schema.Types.ObjectId,
    ref: 'Musics',
  }],
},
{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
});

module.exports = mongoose.model('Games', GamesSchema);