import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import winston from 'winston';
import expressWinston from 'express-winston';
import colors from 'colors';
import http from 'http';
import { instrument } from '@socket.io/admin-ui';
import socketio from './socket/Socket';
const errorController = require('./controllers/errorController');

import {
  CategoriesRoute,
  MusicsRoute,
  MoviesRoute,
  UsersRoute,
  GamesRoute,
  HistoryRoute,
  TodayRoute,
  HistoryTodayRoute,
} from './routes';

const PORT = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);

// connect to Mongo when the app initializes
mongoose.connect(`mongodb+srv://Cl3tus:YNpBR6Q67pGFaHvP@cluster0.ukxknfk.mongodb.net/BlindTus?retryWrites=true&w=majority`);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
  ],
  meta: false,
  msg: `{{res.statusCode}} - {{req.method}} - {{req.url}} - {{res.responseTime}}ms`,
  expressFormat: true,
  colorize: true,
}));

// routes
app.use('/api/doc', express.static(__dirname + '/doc'));
app.use('/api/categories', CategoriesRoute);
app.use('/api/musics', MusicsRoute);
app.use('/api/musicsday', TodayRoute);
app.use('/api/movies', MoviesRoute);
app.use('/api/users', UsersRoute);
app.use('/api/games', GamesRoute);
app.use('/api/history', HistoryRoute);
app.use('/api/historytoday', HistoryTodayRoute);
app.use(errorController);

// Websocket
const io = socketio.getIo(server);
instrument(io, { auth: false});


server.listen(PORT, () => {
  console.log('Server is running on port ' + `${PORT}`.green);
});