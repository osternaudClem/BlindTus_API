import { v4 } from 'uuid';
const games = [];
const readyPlayers = {};

/**
 * @name createGame
 * @param {string} roomId
 * @param {Object[]} musics
 * @param {Object[]} users
 * @returns {Object}
 */
const createGame = (roomId, musics, users) => {
  const id = v4();
  const movieTitles = [];

  musics.map((music) => movieTitles.push(music.movie.title_fr));

  games.push({
    id,
    room: roomId,
    settings: {
      time_limit: 30,
      difficulty: 'easy',
      total_musics: musics.length,
    },
    step: 0,
    movies: movieTitles,
    rounds: [],
    users,
  });

  const gameIndex = games.findIndex((g) => g.room === roomId);
  readyPlayers[roomId] = [];

  return games[gameIndex];
};

/**
 * @name addScore
 * @param {string} roomId
 * @param {string} userId
 * @param {string} username
 * @param {number} score
 * @param {string} answer
 * @param {number} step
 * @returns {Object}
 */
const addScore = (roomId, userId, username, score, answer, step) => {
  const game = games.find((g) => g.room === roomId);

  if (!game) {
    return { error: 'Game not found' };
  }

  const gameStep = game.rounds.find((s) => s.step === step);

  if (!gameStep) {
    game.rounds.push({ step, scores: [] });
  }

  const stepIndex = game.rounds.findIndex((s) => s.step === step);

  game.rounds[stepIndex].scores.push({ user: userId, username, score, answer });

  return game;
};

/**
 * @name resetScore
 * @param {string} roomId
 * @returns {Object}
 */
const resetScore = (roomId) => {
  const gameIndex = games.findIndex((g) => g.room === roomId);

  if (gameIndex < 0) {
    return { error: 'Game not found' };
  }

  games[gameIndex].rounds = [];

  return games[gameIndex];
};

/**
 * @name deleteGame
 * @param {Object}
 * @returns { Object}
 */
const deleteGame = ({ gameId, roomId }) => {
  const gameIndex = games.findIndex(
    (g) => g.id === gameId || g.room === roomId
  );

  if (gameIndex < 0) {
    return { error: 'Game not found' };
  }

  const game = games.splice(gameIndex, 1);
  return game[0];
};

/**
 * @name removeGameUser
 * @param {Obejct}
 */
const removeGameUser = ({ gameId, roomId, userId }) => {
  const index = games.findIndex((g) => g.id === gameId || g.room === roomId);
  if (index !== -1) {
    const userIndex = games[index].users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      games[index].users.splice(userIndex, 1);
      return games[index];
    }
  }
};

/**
 * @name getGame
 * @param {string} roomId
 * @returns {Object}
 */
const getGame = (roomId) => {
  return games.find((g) => g.room === roomId);
};

/**
 * @name getAllGames
 * @returns {Object[]}
 */
const getAllGames = () => {
  return games;
};

/**
 * @name addReadyPlayer
 * @param {string} roomId
 * @param {string} userId
 * @returns {string[]}
 */
const addReadyPlayer = (roomId, userId) => {
  // Check if the user is not alrady added
  const index = readyPlayers[roomId].findIndex((player) => player === userId);

  if (index === -1) {
    readyPlayers[roomId].push(userId);
  }

  return readyPlayers[roomId];
};

/**
 * @name cleanReadyPlayers
 * @param {string} roomid
 * @returns {Array}
 */
const cleanReadyPlayers = (roomid) => {
  return (readyPlayers[roomid] = []);
};

module.exports = {
  createGame,
  addScore,
  resetScore,
  deleteGame,
  getGame,
  getAllGames,
  removeGameUser,
  addReadyPlayer,
  cleanReadyPlayers,
};
