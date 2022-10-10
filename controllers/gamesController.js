import { Types } from 'mongoose';
import { GamesModel, MoviesModel } from '../models';
import { createNewEntity, mergeEntity } from '../utils/modelUtils';
import { shuffle } from '../utils/arrayUtils';
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
      })
      .populate('created_by');

    } else {
      game = await GamesModel.findOne({ code: gameId }).populate({
        path: 'musics',
        populate: {
          path: 'movie',
        },
      })
      .populate('created_by');
    }

    if (!game.code) {
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

  const movies = await MoviesModel.find();
  const proposals = [];
    
  game.musics.map(music => {
    const moviesGenre = music.movie.genres[0];
    const moviesSameGenre = movies.filter(mo => {
      if (mo.title_fr === music.movie.title_fr) {
        return;
      }
      return mo.genres.find(g => g === moviesGenre);
    });

    const musicProposals = shuffle(moviesSameGenre).slice(0, 10).map(({ title_fr }) => title_fr);
    proposals.push(musicProposals);
  });

  game.proposals = proposals;

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
