const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationsSchema = new Schema(
  {
    title: {
      type: 'string',
    },

    content: {
      type: 'string',
      required: true,
    },

    type: {
      type: 'string',
      default: 'new', // [new, feature, update]
    },

    active: {
      type: 'boolean',
      default: false,
    },

    // Associations
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Users',
      },
    ],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = mongoose.model('Notifications', NotificationsSchema);
