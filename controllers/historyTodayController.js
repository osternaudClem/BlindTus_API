import mongoose from 'mongoose';
import { HistoryTodayModel } from '../models';
import * as Today from '../controllers/todayController';
import * as Users from '../controllers/usersController';
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
    const history = await HistoryTodayModel.findById(historyId)
      .populate('user')
      .populate('today');

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

    return await HistoryTodayModel.findOne({
      today: today.music._id,
      user: userId,
    });
  } catch (error) {
    return error;
  }
}

export async function getHistoryByUser(userId) {
  try {
    return await HistoryTodayModel.find({ user: userId });
  } catch (error) {
    return error;
  }
}

/**
1 - 3000
2 - 1200
3 - 600
4 - 300
5 - 150
 */

const expPerRound = [3000, 1200, 600, 300, 150];

export async function saveHistory(history) {
  try {
    const updatedHistory = await HistoryTodayModel.findOneAndUpdate(
      { user: history.user, today: history.today },
      history,
      {
        new: true,
        upsert: true,
      }
    ).populate('user');

    let exp = 0;

    if (history.isWin) {
      exp = expPerRound[updatedHistory.attempts.length - 1];
    }

    console.log('>>> updatedHistory', updatedHistory);

    return {
      user: await Users.patchUser(updatedHistory.user._id, {
        exp: Math.round(updatedHistory.user.exp + parseInt(exp)),
      }),
      history: updatedHistory,
    };
  } catch (error) {
    return error;
  }
}
