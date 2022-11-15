import slug from 'slug';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategoriesSchema = new Schema(
  {
    label: {
      type: 'string',
      required: true,
    },

    label_fr: {
      type: 'string',
    },

    slug: {
      type: 'string',
      unique: true,
    },

    type: {
      type: 'string',
      default: 'movie', // movies or tvShows
    },

    // Associations
    musics: {
      type: Schema.Types.ObjectId,
      ref: 'Musics',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

CategoriesSchema.pre('save', function (next) {
  this.slug = slug(this.label);
  next();
});

module.exports = mongoose.model('Categories', CategoriesSchema);
