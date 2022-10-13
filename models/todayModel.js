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
  });

TodaySchema.pre('save', function(next) {
  const date = new Date();
  const dateParis = new Date(date.getTime() + 2 * 60 * 60 * 1000);

  this.created_at = dateParis;
  this.updated_at = dateParis;
  
  next();
});

module.exports = mongoose.model('Today', TodaySchema);