import { startOfDay, endOfDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { TodayModel, MusicsModel } from '../models';
import { createNewEntity, mergeEntity } from '../utils/modelUtils';
import { shuffle } from '../utils/arrayUtils';

export async function getMusics() {
  try {
    const musics = await TodayModel.find().populate({
      path: 'music',
      populate: {
        path: 'movie',
      },
    });

    const shuffleMusics = shuffle(musics);

    return shuffleMusics;
  } catch (error) {
    return error;
  }
}

export async function postMusic(music) {
  try {
    const newMusic = createNewEntity(music, TodayModel);
    return newMusic.save();
  } catch (error) {
    return error;
  }
}

const calcZonedDate = (date, tz, fn, options = null) => {
  const inputZoned = utcToZonedTime(date, tz);
  const fnZoned = options ? fn(inputZoned, options) : fn(inputZoned);
  return zonedTimeToUtc(fnZoned, tz);
};

const getZonedStartOfDay = (date, timeZone) => {
  return calcZonedDate(date, timeZone, startOfDay);
};

const getZonedEndOfDay = (date, timeZone) => {
  return calcZonedDate(date, timeZone, endOfDay);
};

export async function getMusic() {
  let music = null;

  const start = getZonedStartOfDay(new Date(), 'Europe/Paris');
  const end = getZonedEndOfDay(new Date(), 'Europe/Paris');

  try {
    music = await TodayModel.findOne({
      created_at: {
        $gte: start,
        $lt: end,
      },
    }).populate({
      path: 'music',
      populate: {
        path: 'movie',
      },
    });

    if (!music) {
      const musics = await MusicsModel.find({ today: null, verified: true });
      const shuffledMusics = shuffle(musics);

      const newMusic = createNewEntity(
        { music: shuffledMusics[0] },
        TodayModel
      );
      music = await newMusic.save();
      music = await music.populate({
        path: 'music',
        populate: {
          path: 'movie',
        },
      });
    }

    const count = await TodayModel.count();
    return { music, count };
  } catch (error) {
    return error;
  }
}

export async function getTodayFromYesterday() {
  try {
    const music = await TodayModel.find().populate({
      path: 'music',
      populate: {
        path: 'movie',
      },
    });

    console.log('>>> yesterday', music.at(-2)._id);

    return music.at(-2);
  } catch (error) {
    return error;
  }
}
