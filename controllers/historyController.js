import { HistoryModel } from '../models';
import { createNewEntity, mergeEntity } from '../utils/modelUtils';
import { errorMessages } from '../utils/errorUtils';

export async function getAllHistory(userId) {
  let filter = {};
  try {
    if (userId) {
      filter.user = userId
    }

    const history = await HistoryModel.find(filter).populate('game');
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
    const history = await HistoryModel.findById(historyId).populate('user').populate('game');
    
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
    return await newHistory.save();
  } catch (error) {
    return error;
  }
}
