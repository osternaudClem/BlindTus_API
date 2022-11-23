const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GamesSchema = new Schema(
  {
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

    proposals: {
      type: 'array',
    },

    // Associations
    musics: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Musics',
      },
    ],

    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Categories',
      },
    ],

    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = mongoose.model('Games', GamesSchema);
