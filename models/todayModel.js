const mongoose = require('mongoose');
const Bcrypt = require('bcryptjs');
const validator = require('validator');
const moment = require('moment-timezone');

const Schema = mongoose.Schema;

const TodaySchema = new Schema({
  // Associations
  music: {
    type: Schema.Types.ObjectId,
    ref: 'Musics',
    unique: true,
  },
},
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  }
);

module.exports = mongoose.model('Today', TodaySchema);