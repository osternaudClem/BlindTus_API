const mongoose = require('mongoose');
const Bcrypt = require('bcryptjs');
const validator = require('validator');

const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  username: {
    type: 'string',
    required: true,
    unique: true,
  },

  email: {
    type: 'string',
    required: true,
    unique: true,
  },

  password: {
    type: 'string',
    required: true,
  },

  confirmed: {
    type: 'boolean',
    default: false,
  },

  token: {
    type: 'string',
  },

  expired: {
    type: 'number',
    default: Date.now(),
  },

  avatar: {
    type: 'string',
  },

  avatarSettings: {
    type: 'map',
    of: 'string',
  },

  // Associations
  today: [{
    type: Schema.Types.ObjectId,
    ref: 'Today',
  }],

  historyToday: [{
    type: Schema.Types.ObjectId,
    ref: 'HistoryToday',
  }],
},
{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
});

UsersSchema.pre('save', function (next) {
  if(!this.isModified('password')) {
    return next();
  }
  
  this.password = Bcrypt.hashSync(this.password, 10);
  next();
});

module.exports = mongoose.model('Users', UsersSchema);