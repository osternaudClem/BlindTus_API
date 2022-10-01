const rooms = [];

const addRoom = (room) => {
  rooms.push(room);
  return { room };
}

const removeRoom = (id) => {
  const index = rooms.findIndex((user) => {
    return room.id === id
  });

  if (index !== -1) {
    const room = rooms.splice(index, 1);
    return room[0];
  }
}

const getAllRooms = () => {
  return rooms;
}

const getRoom = (id) => rooms
  .find((room) => room.id === id);

const updateRoom = (id, updated) => {
  const room = rooms.find((room) => room.id === id);
  const index = rooms.findIndex((room) => {
    return room.id === id;
  });

  for (const [key, value] of Object.entries(updated)) {
    room[key] = value;
  }

  rooms[index] = room;
}

// const addScore = (id, user_id, score) => {
//   const room = rooms.find((room) => room.id === id);
//   const roomIndex = rooms.findIndex((room) => {
//     return room.id === id;
//   });

//   const userIndex = room.users.findIndex((user) => {
//     return user.id === user_id;
//   });

//   room.users[userIndex].scores.push(score);

//   rooms[roomIndex] = room;

//   return room;
// }

module.exports = {
  addRoom,
  updateRoom,
  removeRoom,
  getRoom,
  getAllRooms,
};