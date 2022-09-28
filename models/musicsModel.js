import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const MusicsSchema = new Schema({
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
    type: 'string',
  },

  // Associations
  category: [{
    type: Schema.Types.ObjectId,
    ref: 'Categories',
  }],

  movie: {
    type: Schema.Types.ObjectId,
    ref: 'Movies',
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
  }
);

module.exports = mongoose.model('Musics', MusicsSchema);
