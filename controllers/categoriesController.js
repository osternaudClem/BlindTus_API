import { CategoriesModel, MoviesModel, TVShowsModel } from '../models';
import { createNewEntity, mergeEntity } from '../utils/modelUtils';
import { errorMessages } from '../utils/errorUtils';

export async function getCategories() {
  try {
    const categories = await CategoriesModel.find();
    return categories;
  } catch (error) {
    return error;
  }
}

export async function getCategory(categoryId) {
  if (!categoryId) {
    return errorMessages.generals.missingId;
  }

  try {
    const category = await CategoriesModel.findById(categoryId).populate(
      'musics'
    );

    if (!category) {
      return errorMessages.categories.notFound;
    }

    return category;
  } catch (error) {
    return error;
  }
}

export async function getCategoryBySlug(slug, fields = null) {
  if (!slug) {
    return errorMessages.generals.missingId;
  }

  try {
    let category = await CategoriesModel.findOne({ slug }).populate('musics');

    let filledCategory = category._doc;

    if (!category) {
      return errorMessages.categories.notFound;
    }
    // Add movies
    if (fields.includes('movies')) {
      const movies = await MoviesModel.find({
        category: category._id,
      }).populate('added_by');
      filledCategory = { ...filledCategory, movies };
    }

    if (fields.includes('tvShows')) {
      const tvShows = await TVShowsModel.find({
        category: category._id,
      }).populate('added_by');

      filledCategory = { ...filledCategory, tvShows };
    }

    return filledCategory;
  } catch (error) {
    return error;
  }
}

export async function postCategory(category) {
  const newCategory = createNewEntity(category, CategoriesModel);

  try {
    return await newCategory.save();
  } catch (error) {
    return error;
  }
}

export async function patchCategory(categoryId, updatesAttributes) {
  if (!categoryId) {
    return errorMessages.generals.missingId;
  }

  try {
    const category = await CategoriesModel.findById(categoryId);

    if (!category) {
      return errorMessages.categories.notFound;
    }

    const updatedCategory = mergeEntity(updatesAttributes, CategoriesModel);

    for (const key in updatedCategory) {
      if (key === 'musics') {
        category.musics.push(updatedCategory.musics);
      } else {
        category[key] = updatedCategory[key];
      }
    }

    return await category.save();
  } catch (error) {
    return error;
  }
}

export async function deleteCategory(categoryId) {
  if (!categoryId) {
    return errorMessages.generals.missingId;
  }

  try {
    const category = await CategoriesModel.findOneAndDelete({
      _id: categoryId,
    });

    if (!category) {
      return errorMessages.categories.notFound;
    }

    return category;
  } catch (error) {
    return error;
  }
}
