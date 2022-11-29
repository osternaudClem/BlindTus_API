import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const TVShowsSchema = new Schema(
  {
    title: {
      type: 'string',
      required: true,
    },

    title_fr: {
      type: 'string',
      required: true,
    },

    simple_title: {
      type: 'array',
    },

    casts: {
      type: 'array',
    },

    backdrop_path: {
      type: 'string',
    },

    poster_path: {
      type: 'string',
    },

    first_air_date: {
      type: 'number',
    },

    last_air_date: {
      type: 'number',
    },

    imdb_id: {
      type: 'string',
    },

    mdb_id: {
      type: 'number',
    },

    tagline: {
      type: 'string',
    },

    overview: {
      type: 'string',
    },

    genres: {
      type: 'array',
    },

    networks: {
      type: 'array',
    },

    number_of_episodes: {
      type: 'number',
    },

    number_of_seasons: {
      type: 'number',
    },

    status: {
      type: 'string',
    },

    verified: {
      type: 'boolean',
      default: false,
    },

    // Associations
    musics: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Musics',
      },
    ],

    category: {
      type: Schema.Types.ObjectId,
      ref: 'Categories',
    },

    forcePropositions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'TVShows',
      },
    ],

    added_by: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      default: '6329bcf462eb85395efa3320', // Cl3tus
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = mongoose.model('TVShows', TVShowsSchema);
