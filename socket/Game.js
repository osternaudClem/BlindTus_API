import { v4 } from 'uuid';
const games = [];

const createGame = (roomId, musics, users) => {
  const id = v4();
  const movieTitles = [];

  musics.map(music => movieTitles.push(music.movie.title_fr));

  games.push({
    id,
    room: roomId,
    step: 0,
    movies: movieTitles,
    rounds: [],
    users,
  });

  const gameIndex = games.findIndex(g => g.room === roomId);

  return games[gameIndex];
}

const addScore = (roomId, userId, username, score, step) => {
  const game = games.find(g => g.room === roomId);

  if (!game) {
    return { error: 'Game not found' };
  }

  const gameStep = game.rounds.find(s => s.step === step);

  if (!gameStep) {
    game.rounds.push({ step, scores: [] });
  }

  const stepIndex = game.rounds.findIndex(s => s.step === step);

  game.rounds[stepIndex].scores.push({ user: userId, username, score });

  return game;
}

const deleteGame = ({ gameId, roomId }) => {
  const index = games.findIndex(g => g.id === gameId || g.room === roomId);

  if (index !== -1) {
    const game = games.splice(index, 1);
    return game[0];
  }
}

const getGame = (roomId) => {
  return games.find(g => g.room === roomId);
}

const getAllGames = () => {
  return games;
}

module.exports = {
  createGame,
  addScore,
  deleteGame,
  getGame,
  getAllGames,
};