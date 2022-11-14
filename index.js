import express from 'express';
import bodyParser from 'body-parser';
import boolParser from 'express-query-boolean';
import cors from 'cors';
import mongoose from 'mongoose';
import winston from 'winston';
import expressWinston from 'express-winston';
import colors from 'colors';
import http from 'http';
import { instrument } from '@socket.io/admin-ui';
import dotenv from 'dotenv';
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

// get config vars
dotenv.config();

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
// connect to Mongo when the app initializes
mongoose.connect(process.env.MONGO_URL);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(boolParser());

app.use(cors());

app.use(
  expressWinston.logger({
    transports: [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    ],
    meta: false,
    msg: `{{res.statusCode}} - {{req.method}} - {{req.url}} - {{res.responseTime}}ms`,
    expressFormat: true,
    colorize: true,
  })
);

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token === null || token === undefined) return res.sendStatus(401);

  if (token !== process.env.TOKEN_SECRET) {
    return res.status(403).send('Token invalid !');
  }

  next();
}

app.use(
  '/',
  express.static('datas', {
    etag: false,
  })
);

// routes
app.use('/doc', express.static(__dirname + '/doc'));
app.use('/categories', authenticateToken, CategoriesRoute);
app.use('/musics', authenticateToken, MusicsRoute);
app.use('/musicsday', authenticateToken, TodayRoute);
app.use('/movies', authenticateToken, MoviesRoute);
app.use('/users', authenticateToken, UsersRoute);
app.use('/games', authenticateToken, GamesRoute);
app.use('/history', authenticateToken, HistoryRoute);
app.use('/historytoday', authenticateToken, HistoryTodayRoute);
app.use(errorController);

// Websocket
const io = socketio.getIo(server);
instrument(io, { auth: false });

server.listen(PORT, () => {
  console.log('Server is running on port ' + `${PORT}`.green);
});
