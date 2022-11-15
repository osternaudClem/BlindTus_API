import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const MusicsSchema = new Schema(
  {
    title: {
      type: 'string',
    },

    author: {
      type: 'string',
    },

    video: {
      type: 'string',
      required: true,
    },

    timecode: {
      type: 'number',
      default: 0,
    },

    audio_name: {
      type: 'string',
    },

    proposals: {
      type: 'array',
    },

    verified: {
      type: 'boolean',
      default: false,
    },

    // Associations
    category: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Categories',
      },
    ],

    movie: {
      type: Schema.Types.ObjectId,
      ref: 'Movies',
    },

    tvShow: {
      type: Schema.Types.ObjectId,
      ref: 'TVShows',
    },

    today: {
      type: Schema.Types.ObjectId,
      ref: 'Today',
    },

    added_by: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      default: '6329bcf462eb85395efa3320',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = mongoose.model('Musics', MusicsSchema);
