import { startOfDay, endOfDay } from 'date-fns';
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

export async function getMusic() {
  let music = null;

  const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

  const start = new Date(startOfDay(new Date()).getTime() + 2 * 60 * 60 * 1000);
  const end = new Date(endOfDay(new Date()).getTime() + 2 * 60 * 60 * 1000);

  console.log('>>> start', start);
  console.log('>>> end', end);

  console.log('>>> isDev ?', (!process.env.NODE_ENV || process.env.NODE_ENV === 'development'));

  console.log('>>> time', new Date());

  try {
    music = await TodayModel.findOne({
      created_at: {
        '$gte': start,
        '$lt': end,
      }
    }).populate({
      path: 'music',
      populate: {
        path: 'movie',
      },
    });

    if (!music) {
      const musics = await MusicsModel.find({ today: null });
      const shuffledMusics = shuffle(musics);

      const newMusic = createNewEntity({ music: shuffledMusics[0] }, TodayModel);
      music = await newMusic.save();
    }

    const count = await TodayModel.count();
    return { music, count };
  } catch (error) {
    return error;
  }
}
