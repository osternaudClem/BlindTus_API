import { Server } from 'socket.io';
import {
  addUser,
  updateUser,
  getUser,
  getUsersInRoom,
  deleteUser,
} from './User';

import {
  addRoom,
  updateRoom,
  removeRoom,
  removeUser,
  getRoom,
  addPlayer,
  addScore,
  resetGame,
  updateLoading,
  cleanReadyPlayers,
} from './Room';

import * as Musics from '../controllers/musicsController';

let io = null;

const getIo = function (server) {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://admin.socket.io',
        'https://blindtus.com',
      ],
      // origin: '*',
      credentials: true,
    },
    path: '/ws',
  });

  io.listen(4001);

  io.on('connection', (socket) => {
    console.log('>>> new connection', socket.id);

    socket.on('disconnect', (reason) => {
      const user = getUser({ id: socket.id });

      if (user) {
        if (user.isCreator) {
          const users = getUsersInRoom(user.room);

          if (users.length > 1) {
            updateUser(users[1].username, { isCreator: true });
            socket.broadcast.to(users[1].id).emit('NEW_CREATOR');
          }
        }

        const room = removeUser(user.room, socket.id);
        deleteUser(socket.id);

        io.to(user.room).emit('ROOM_USERS', room.players);

        if (!io.sockets.adapter.rooms.has(room.id)) {
          removeRoom(user.room);
        }

        if (user.room) {
          io.to(user.room).emit(
            'PLAYER_DISCONNECTED',
            user.username,
            room,
            reason
          );
        }

        console.log('>>> disconnected', socket.id);
      }
    });

    socket.on('FORCE_DISCONNECT', () => {
      socket.disconnect();
    });

    socket.on('KICK_USER', ({ user }) => {
      const userInfo = getUser({ username: user.username });
      io.to(userInfo.id).emit('KICK');
    });

    socket.on('CREATE_ROOM', ({ username, room, settings }, callback) => {
      const user = joinRoom(socket, username, room, true);

      const newRoom = addRoom(room, user, settings);

      callback(newRoom);
    });

    socket.on('JOIN_ROOM', ({ username, room }, callback) => {
      const roomCode = room;

      if (io.sockets.adapter.rooms.has(roomCode)) {
        joinRoom(socket, username, roomCode, false);
        const user = getUser({ username });
        const room = addPlayer(roomCode, user);
        callback({ user, room });
      } else {
        callback({ error: `The room ${roomCode} doesn't exist`, code: 1 });
      }
    });

    socket.on('UPDATE_SETTINGS', (roomId, settings) => {
      const room = updateRoom(roomId, { settings });
      io.to(roomId).emit('SETTINGS_UPDATED', room);
    });

    socket.on('INIT_GAME', async () => {
      const user = getUser({ id: socket.id });
      const room = getRoom(user.room);

      const musics = await Musics.getMusics(
        room.settings.total_musics,
        true,
        false,
        false,
        Object.keys(room.settings.categories).filter(
          (c) => room.settings.categories[c]
        )
      );

      updateRoom(room.id, {
        musics,
        step: 0,
        next_step: 1,
        total_step: musics.length,
        rounds: [],
      });
      io.to(user.room).emit('START_GAME', room);
    });

    socket.on('ASK_START_MUSIC', () => {
      const user = getUser({ id: socket.id });
      let room = getRoom(user.room);
      room = updateRoom(user.room, { step: room.next_step });

      io.to(room.id).emit('START_MUSIC', room);
    });

    socket.on('UPDATE_LOADING', (loading) => {
      const user = getUser({ id: socket.id });
      const players = updateLoading(user.room, user.id, loading);
      io.to(user.room).emit('IS_EVERYBODY_READY', {
        allReady: false,
        loadings: players,
      });
    });

    socket.on('PLAYER_AUDIO_READY', () => {
      const user = getUser({ id: socket.id });
      const room = getRoom(user.room);
      const players = updateLoading(room.id, user.id, 100);

      io.to(room.id).emit('IS_EVERYBODY_READY', {
        allReady:
          room.players.length ===
          players.filter((p) => p.loading === 100).length,
      });
    });

    socket.on('ADD_SCORE', ({ score, step, answer }, callback) => {
      const user = getUser({ id: socket.id });
      let room = getRoom(user.room);

      const updatedRoom = addScore(
        room.id,
        user.id,
        user.username,
        score,
        answer,
        step
      );

      const usersLength = room.players.length;

      io.to(room.id).emit('UPDATE_SCORES', updatedRoom);
      if (updatedRoom.rounds[step - 1].scores.length === usersLength) {
        const nextStep = step + 1;
        room = updateRoom(room.id, { next_step: nextStep });
        cleanReadyPlayers(room.id);

        io.to(room.id).emit('NEXT_ROUND', {
          room: updatedRoom,
          isEndGame: nextStep === room.musics.length,
        });
      }

      callback(updatedRoom);
    });

    socket.on('ASK_NEW_GAME', () => {
      const user = getUser({ id: socket.id });
      const room = resetGame(user.room);
      io.to(user.room).emit('NEW_GAME', room);
    });
  });

  return io;
};

const joinRoom = function (socket, username, room, isCreator) {
  const user = addUser(socket.id, username, room, isCreator);
  if (user.error) return callback(user.error);
  socket.join(room);

  io.to(room).emit('ROOM_USERS', getUsersInRoom(room));

  return user;
};

module.exports = {
  getIo,
  joinRoom,
};
