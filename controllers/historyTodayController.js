import mongoose from 'mongoose';
import { HistoryTodayModel } from '../models';
import * as Today from '../controllers/todayController';
import { createNewEntity, mergeEntity } from '../utils/modelUtils';
import { errorMessages } from '../utils/errorUtils';

export async function getAllHistory() {
  try {
    const history = await HistoryTodayModel.find().populate('today');
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
    const history = await HistoryTodayModel.findById(historyId).populate('user').populate('today');

    if (!history) {
      return errorMessages.history.notFound;
    }

    return history;
  } catch (error) {
    return error;
  }
}

export async function getTodayUser(userId) {
  try {
    const today = await Today.getMusic();
    
    return HistoryTodayModel.findOne({ today: today._id, user: userId});
  } catch (error) {
    return error;
  }
}

export async function saveHistory(history) {
  try {
    const updatedHistory = await HistoryTodayModel.findOneAndUpdate({ user: history.user, today: history.today }, history, {
      new: true,
      upsert: true,
    });
    return updatedHistory;
  } catch (error) {
    return error;
  }
}
