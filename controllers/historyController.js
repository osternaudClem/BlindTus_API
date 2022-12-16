import { HistoryModel } from '../models';
import * as Users from './usersController';
import { createNewEntity, mergeEntity } from '../utils/modelUtils';
import { errorMessages } from '../utils/errorUtils';

export async function getAllHistory(userId) {
  let filter = {};
  try {
    if (userId) {
      filter.user = userId;
    }

    const history = await HistoryModel.find(filter).populate({
      path: 'game',
      populate: {
        path: 'created_by',
      },
    });

    return history;
  } catch (error) {
    return error;
  }
}

export async function getHistory(historyId) {
  if (!historyId) {
    return errorMessages.generals.missingId;
  }

  try {
    const history = await HistoryModel.findById(historyId)
      .populate('user')
      .populate({
        path: 'game',
        populate: {
          path: 'created_by',
        },
      });

    if (!history) {
      return errorMessages.history.notFound;
    }

    return history;
  } catch (error) {
    return error;
  }
}

export async function generateHistory(history) {
  const newHistory = createNewEntity(history, HistoryModel);
  try {
    await newHistory.save();

    let multiExp = 1;

    if (history.game.difficulty === 'difficult') {
      multiExp = multiExp * 1.6;
    }

    if (history.game.categories.length > 1) {
      multiExp = multiExp * 1.3;
    }

    return await Users.patchUser(history.user._id, {
      exp: Math.round(
        history.user.exp + parseInt(history.totalScore * multiExp)
      ),
    });
  } catch (error) {
    return error;
  }
}
