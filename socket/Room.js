const rooms = [];
const readyPlayers = {};

/*
room = {
  id: 4 numbers ID,
  creator: username.
  settings: {
    time_limit,
    difficulty,
    total_musics
  },
  step: 0,
  next_step: 1,
  players: []
}
*/

const addRoom = (id, user, settings) => {
  const room = {
    id: id,
    creator: user.id,
    settings,
    players: [user],
  };
  rooms.push(room);
  readyPlayers[id] = [];
  return room;
};

const removeRoom = (id) => {
  const index = rooms.findIndex((r) => r.id === id);

  if (index !== -1) {
    const room = rooms.splice(index, 1);
    return room[0];
  }
};

const getAllRooms = () => {
  return rooms;
};

/**
 *
 * @param {string} id
 * @returns {{ id: string, settings: object, musics: array, step: number, totalStep: number, users: array}}
 */
const getRoom = (id) => rooms.find((room) => room.id === id);

const updateRoom = (id, updated) => {
  const room = rooms.find((room) => room.id === id);
  const index = rooms.findIndex((room) => {
    return room.id === id;
  });

  for (const [key, value] of Object.entries(updated)) {
    room[key] = value;
  }

  rooms[index] = room;

  return room;
};

const addPlayer = (id, user) => {
  const index = rooms.findIndex((r) => r.id === id);

  if (index === -1) {
    return { error: 'Room not found' };
  }

  rooms[index].players.push(user);

  return rooms[index];
};

/**
 * @name addScore
 * @param {string} id
 * @param {string} userId
 * @param {string} username
 * @param {number} score
 * @param {string} answer
 * @param {number} step
 * @returns {Object}
 */
const addScore = (id, user_id, username, score, answer, step) => {
  const room = rooms.find((r) => r.id === id);

  if (!room) {
    return { error: 'Room not found' };
  }

  const gameStep = room.rounds.find((s) => s.step === step);

  if (!gameStep) {
    room.rounds.push({ step, scores: [] });
  }

  const stepIndex = room.rounds.findIndex((s) => s.step === step);

  room.rounds[stepIndex].scores.push({
    user: user_id,
    username,
    score,
    answer,
  });

  return room;
};

const resetGame = (room_id) => {
  const index = rooms.findIndex((r) => r.id === room_id);

  if (index === -1) {
    return { error: 'Room not found' };
  }

  // Reset musics
  const room = {
    ...rooms[index],
    musics: [],
    rounds: [],
    step: 0,
    next_step: 1,
  };

  rooms[index] = room;

  return room;
};

const removeUser = (room_id, user_id) => {
  const roomIndex = rooms.findIndex((r) => r.id === room_id);

  if (roomIndex === -1) {
    return { error: 'Room not found' };
  }

  const playerIndex = rooms[roomIndex].players.findIndex(
    (p) => p.id === user_id
  );

  if (playerIndex === -1) {
    return { error: 'Player not found' };
  }

  rooms[roomIndex].players.splice(playerIndex, 1);

  return rooms[roomIndex];
};

/**
 * @name addReadyPlayer
 * @param {string} room_id
 * @param {string} user_id
 * @returns {string[]}
 */
const addReadyPlayer = (room_id, user_id) => {
  // Check if the user is not alrady added
  const index = readyPlayers[room_id].findIndex((player) => player === user_id);

  if (index === -1) {
    readyPlayers[room_id].push(user_id);
  }

  return readyPlayers[room_id];
};

const updateLoading = (room_id, user_id, loading) => {
  // Check if the user is not alrady added
  const index = readyPlayers[room_id].findIndex((p) => p.id === user_id);

  if (index === -1) {
    readyPlayers[room_id].push({ id: user_id, loading });
  } else {
    if (readyPlayers[room_id][index].loading < 100) {
      readyPlayers[room_id][index].loading = loading;
    }
  }

  return readyPlayers[room_id];
};

/**
 * @name cleanReadyPlayers
 * @param {string} id
 * @returns {Array}
 */
const cleanReadyPlayers = (id) => {
  return (readyPlayers[id] = []);
};

module.exports = {
  addRoom,
  updateRoom,
  removeRoom,
  getRoom,
  getAllRooms,
  addPlayer,
  addScore,
  resetGame,
  removeUser,
  addReadyPlayer,
  updateLoading,
  cleanReadyPlayers,
};
