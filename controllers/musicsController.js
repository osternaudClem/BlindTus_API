import { MusicsModel, MoviesModel } from '../models';
import * as Categories from './categoriesController';
import { createNewEntity, mergeEntity } from '../utils/modelUtils';
import { errorMessages } from '../utils/errorUtils';
import { shuffle } from '../utils/arrayUtils';

export async function getMusics(limit = 10, withProposals = false) {
  try {
    const musics = await MusicsModel.find().populate('movie');
    const shuffleMusics = shuffle(musics).slice(0, limit);

    let returnedMusics = [];

    if (withProposals) {
      const movies = await MoviesModel.find();

      shuffleMusics.map((music, index) => {
        const moviesGenre = music.movie.genres[0];
        const moviesSameGenre = movies.filter(mo => {
          if (mo.title_fr === music.movie.title_fr) {
            return;
          }
          return mo.genres.find(g => g === moviesGenre);
        });

        const musicProposals = shuffle(moviesSameGenre).slice(0, 10).map(({ title_fr }) => title_fr);
        music.proposals = musicProposals;
        returnedMusics.push(music);
      });
    }

    return returnedMusics.length > 0 ? returnedMusics : shuffleMusics;
  } catch (error) {
    return error;
  }
}

export async function getMusic(musicId) {
  if (!musicId) {
    return errorMessages.generals.missingId;
  }

  try {
    const music = MusicsModel.findById(musicId);

    return music;
  } catch (error) {
    return error;
  }
}

export async function postMusic(music) {
  const categoryId = music.category;

  const newMusic = createNewEntity(music, MusicsModel);

  try {
    const music = await newMusic.save();
    await Categories.patchCategory(categoryId, { musics: music._id });
    return music;
  } catch (error) {
    return error;
  }
}

export async function patchMusic(musicId, updatedAttributes) {
  if (!musicId) {
    return errorMessages.generals.missingId;
  }

  try {
    const music = await MusicsModel.findById(musicId);

    if (!music) {
      return errorMessages.musics.notFound;
    }

    const updatedMusic = mergeEntity(updatedAttributes, MusicsModel);

    for (const key in updatedMusic) {
      music[key] = updatedMusic[key];
    }

    return await music.save();
  } catch (error) {
    return error;
  }
}

export async function deleteMusic(musicId) {
  if (!musicId) {
    return errorMessages.generals.missingId;
  }

  try {
    const music = await MusicsModel.findOneAndDelete({
      _id: musicId,
    });

    if (!music) {
      return errorMessages.musics.notFound;
    }

    return music;
  } catch (error) {
    return error;
  }
} 
