import { Types } from 'mongoose';
import { GamesModel } from '../models';
import { createNewEntity, mergeEntity } from '../utils/modelUtils';
import { errorMessages } from '../utils/errorUtils';

export async function getGames() {
  try {
    const games = await GamesModel.find();
    return games;
  } catch (error) {
    return error;
  }
}

export async function getGame(gameId) {
  if (!gameId) {
    return errorMessages.generals.missingId;
  }

  let game = null;

  try {
    if (Types.ObjectId.isValid(gameId)) {
      game = await GamesModel.findById(gameId).populate({
        path: 'musics',
        populate: {
          path: 'movie',
        },
      });

    } else {
      game = await GamesModel.findOne({ code: gameId }).populate({
        path: 'musics',
        populate: {
          path: 'movie',
        },
      });
    }

    if (!game) {
      return errorMessages.games.notFound;
    }

    return game;
  } catch (error) {
    return error;
  }
}

export async function generateNewGame(game) {
  let code = null;
  let uniqueCode = false;
  // Check if this code is already taken
  const allGames = await GamesModel.find();

  while (!uniqueCode) {
    // Generate 5 characters codes
    code = Math.random().toString(36).substring(2, 7).toUpperCase();
    uniqueCode = !!allGames.filter(g => g.code === code);
  }

  game.code = code;

  const newGame = createNewEntity(game, GamesModel);

  try {
    await newGame.save();
    return await GamesModel.findById(newGame._id).populate({
      path: 'musics',
      populate: {
        path: 'movie',
      },
    });
  } catch (error) {
    return error;
  }
}
