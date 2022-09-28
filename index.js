import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import winston from 'winston';
import expressWinston from 'express-winston';
import colors from 'colors';
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

// import { ErrorController } from './controllers';

const PORT = process.env.PORT || 4000;
const app = express();

console.log('PORT', PORT);

// connect to Mongo when the app initializes
mongoose.connect(`mongodb://localhost:27017/blindTest`);

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

app.listen(PORT, () => {
    console.log('Server is running on port ' + `${PORT}`.green);
});