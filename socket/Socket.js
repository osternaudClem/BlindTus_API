import { Server } from 'socket.io';
import {
  addUser,
  removeUser,
  updateUser,
  getUser,
  getUsersInRoom,
} from './User';

import {
  addRoom,
  removeRoom,
  updateRoom,
  getRoom,
  getAllRooms,
} from './Room';

import {
  createGame,
  addScore,
  deleteGame,
  getGame,
  getAllGames,
} from './Game';

import * as Musics from '../controllers/musicsController';

let io = null;

const getIo = function (server) {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "https://admin.socket.io", "http://blindtus.cl3tus.com"],
      credentials: true,
    },
    path: '/ws'
  });

  io.listen(4001);

  io.on("connection", (socket) => {
    console.log('>>> new connection', socket.id)

    socket.on('disconnect', reason => {
      const user = getUser({ id: socket.id });

      if (user && user.isCreator) {
        const users = getUsersInRoom(user.room);

        if (users.length > 1) {
          updateUser(users[1].username, { isCreator: true });
          socket.broadcast.to(users[1].id).emit('NEW_CREATOR');
        }
      }

      removeUser(socket.id);

      if (user) {
        io.to(user.room).emit('ROOM_USERS',
          getUsersInRoom(user.room)
        );

        if (!io.sockets.adapter.rooms.has(user.room)) {
          deleteGame({ roomId: user.room });
        }

        io.to(user.room).emit('PLAYER_DISCONNECTED', user.username);
      }

      console.log('>>> reason', reason);
    })
    socket.on('FORCE_DISCONNECT', () => {
      socket.disconnect();
    });

    socket.on('CREATE_ROOM', ({ username, room, settings }, callback) => {
      const user = joinRoom(socket, username, room, true);


      addRoom({ id: room, creator: user.id, settings });

      callback({ user });
    });

    socket.on('JOIN_ROOM', ({ username, room }, callback) => {
      const roomCode = room;

      if (io.sockets.adapter.rooms.has(roomCode)) {
        joinRoom(socket, username, roomCode, false);
        const user = getUser({ username });
        const room = getRoom(roomCode);

        const game = getGame(roomCode);
        callback({ user, room, game });
      } else {
        callback({ error: `The room ${roomCode} doesn't exist`, code: 1 });
      };
    });

    socket.on('SEND_CHAT', ({ username, room, message }) => {
      const user = getUser({ username });
      io.to(user.room).emit('MESSAGE', {
        user: username,
        text: message,
      });
    });

    socket.on('UPDATE_SETTINGS', settings => {
      let user = getUser({ id: socket.id });
      let room = getRoom(user.room);
      updateRoom(room.id, { settings });
      socket.broadcast.to(user.room).emit('SETTINGS_UPDATED', settings);
    });

    socket.on('INIT_GAME', async () => {
      const user = getUser({ id: socket.id });
      const users = getUsersInRoom(user.room);
      let room = getRoom(user.room);
      const musics = await Musics.getMusics(room.settings.totalMusics);
      updateRoom(room.id, { musics, step: 0, totalStep: musics.length, users });
      const game = createGame(room.id, musics, users);

      io.to(user.room).emit('START_GAME', ({ room: room.id, game }));
    });

    socket.on('GET_ROOM', (callback) => {
      const user = getUser({ id: socket.id });

      if (!user) {
        return callback({ error: 'User not found' });
      }

      let room = getRoom(user.room);

      callback({ newRoom: room });
    });

    socket.on('ADD_SCORE', ({ score, step }) => {
      const user = getUser({ id: socket.id });
      const room = getRoom(user.room);

      const game = addScore(room.id, user.id, user.username, score, step);
      const usersLength = room.users.length;

      io.to(room.id).emit('UPDATE_SCORES', ({ game }));

      if (game.rounds[step].scores.length === usersLength) {
        const nextStep = step + 1;

        io.to(room.id).emit('NEXT_ROUND', ({
          step: nextStep,
          game,
          isEndGame: nextStep === game.movies.length,
        }));
      }
    });

    socket.on('GET_GAME', ({ roomId }, callback) => {
      const game = getGame(roomId);
      const room = getRoom(roomId);
      callback({ game, room });
    });
  });

  return io;
}

const joinRoom = function (socket, username, room, isCreator) {
  let user = getUser({ username });

  if (!user) {
    const newUser = addUser(
      { id: socket.id, username, room, isCreator });

    if (newUser.error) return callback(newUser.error);
    user = newUser.user;
  }
  else {
    updateUser(username, { id: socket.id, room });
  }

  // Emit will send message to the user
  // who had joined
  socket.emit('MESSAGE', {
    user: 'admin', text:
      `${user.username},
    welcome to room ${room}.`
  });

  socket.join(room);

  io.to(room).emit('ROOM_USERS',
    getUsersInRoom(room)
  );

  return user;
}

module.exports = {
  getIo,
  joinRoom,
}