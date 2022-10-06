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

  const start = new Date(startOfDay(new Date()).getTime());
  const end = new Date(endOfDay(new Date()).getTime());

  console.log('>>> start', start);
  console.log('>>> end', end);
  

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
