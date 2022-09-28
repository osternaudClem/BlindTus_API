import mongoose from 'mongoose';
import { themovieDB } from '../config';
const Schema = mongoose.Schema;

const MoviesSchema = new Schema({
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

  directors: {
    type: 'array',
  },

  backdrop_path: {
    type: 'string',
  },

  poster_path: {
    type: 'string',
  },

  release_date: {
    type: 'number',
  },

  imdb_id: {
    type: 'string',
  },

  mdb_id: {
    type: 'string',
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
  }
);

module.exports = mongoose.model('Movies', MoviesSchema);
