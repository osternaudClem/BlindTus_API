const users = [];

const addUser = ({ id, username, room, isCreator }) => {
  room = room.toString().trim().toLowerCase();

  const existingUser = users.find((user) => {
    user.room === room && user.username === username
  });

  if (existingUser) {
    return { error: "Username is taken" };
  }

  const user = { id, username, room, isCreator, scores: [] };

  users.push(user);
  return { user };
}

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id
  });

  if (index !== -1) {
    const user = users.splice(index, 1);
    return user[0];
  }
}

const getUser = ({ id, username }) => users
  .find((user) => user.id === id || user.username === username);

const updateUser = (username, updated) => {
  const user = users.find((user) => user.username === username);
  const index = users.findIndex((user) => {
    return user.username === username;
  });

  for (const [key, value] of Object.entries(updated)) {
    user[key] = value;
  }

  users[index] = user;
}

const getAllUsers = ({ roomId }) => {
  return users.filter(u => u.room = roomId);
}

const getUsersInRoom = (room) => users
  .filter((user) => user.room === room);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  updateUser,
  getAllUsers,
};