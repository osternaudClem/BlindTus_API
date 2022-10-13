import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import readline from 'readline';
import ytdl from 'ytdl-core';
import slug from 'slug';
import { MusicsModel, MoviesModel } from '../models';
import * as Categories from './categoriesController';
import { createNewEntity, mergeEntity } from '../utils/modelUtils';
import { errorMessages } from '../utils/errorUtils';
import { shuffle } from '../utils/arrayUtils';
import { youtube_parser } from '../utils/stringsUtils';

export async function getMusics(limit = 10, withProposals = false, noShuffle = false) {
  try {
    const musics = await MusicsModel.find().populate('movie');
    let shuffleMusics = musics;

    if (!noShuffle) {
      shuffleMusics = shuffle(musics).slice(0, limit);
    }
    else {
      shuffleMusics = shuffleMusics.slice(0, limit);
    }
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

        const shuffledMovies = shuffle(movies);
        if (moviesSameGenre.length < 10) {
          const limit = moviesSameGenre.length;
          for (let i = 0; i < 10 - limit; i++) {
            let isOk = false;
            while (!isOk) {
              for (let y = 0; y < shuffledMovies.length; y++) {
                if (shuffledMovies[y].title_fr !== music.movie.title_fr && !moviesSameGenre.some(m => m.title_fr === shuffledMovies[y].title_fr)) {
                  moviesSameGenre.push(shuffledMovies[y]);
                  isOk = true;
                  break;
                }
              }
            }
          }
        }

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

export async function getMusic(musicId, withProposals = false) {
  if (!musicId) {
    return errorMessages.generals.missingId;
  }

  try {
    const music = await MusicsModel.findById(musicId).populate('movie');

    let returnedMusic = null;
    if (withProposals) {
      const movies = await MoviesModel.find();
      const moviesGenre = music.movie.genres[0];
      const moviesSameGenre = movies.filter(mo => {
        if (mo.title_fr === music.movie.title_fr) {
          return;
        }
        return mo.genres.find(g => g === moviesGenre);
      });

      const shuffledMovies = shuffle(movies);
      if (moviesSameGenre.length < 10) {
        const limit = moviesSameGenre.length;
        for (let i = 0; i < 10 - limit; i++) {
          let isOk = false;
          while (!isOk) {
            for (let y = 0; y < shuffledMovies.length; y++) {
              if (shuffledMovies[y].title_fr !== music.movie.title_fr && !moviesSameGenre.some(m => m.title_fr === shuffledMovies[y].title_fr)) {
                moviesSameGenre.push(shuffledMovies[y]);
                isOk = true;
                break;
              }
            }
          }
        }
      }

      const musicProposals = shuffle(moviesSameGenre).slice(0, 10).map(({ title_fr }) => title_fr);
      music.proposals = musicProposals;
      returnedMusic = music;
    }

    return returnedMusic || music;
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

async function stall(stallTime = 3000) {
  await new Promise(resolve => setTimeout(resolve, stallTime));
}

export async function extractMp3(limit = 50) {
  const output_dir = isDev
    ? path.join(path.resolve('./') + '/datas/audio')
    : path.join(path.resolve('/home/debian/www/blindtus/api/datas/audio'));

  try {
    const musics = await MusicsModel.find();
    for (const music of musics.slice(100, limit)) {
      const { id, timecode } = youtube_parser(music.video);
      const start = Date.now();
      const audio_name = slug(`${music.author}-${music.title}-${id}`);

      const info = await ytdl.getInfo(music.video);
      const formats = info.formats.filter(f => f.container === 'mp4' && f.hasAudio);

      const stream = ytdl(id, {
        quality: formats[0].itag,
      });

      ffmpeg(stream)
        .audioBitrate(formats[0].audioBitrate)
        .save(`${output_dir}/${audio_name}.mp3`)
        .on('progress', p => {
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(`${p.targetSize}kb downloaded`);
        })
        .on('error', function (err, stdout, sterr) {
          console.log('>>> error', err, music.author, music.title)
        })
        .on('end', async () => {
          console.log(`\ndone, ${music.author} / ${music.title} --- ${(Date.now() - start) / 1000}s`);
          await patchMusic(music._id, {
            timecode,
            audio_name,
          });
        });

      await stall(20);
    }
  } catch (error) {
    console.log('>>> error', error);
  }
}

export async function extractSingleMp3(musicId) {
  try {
    const music = await MusicsModel.findById(musicId);
    const isSaved = await saveMp3(music);
    console.log('>>> isSaved', isSaved);
    return isSaved;

  } catch (error) {
    console.log('>>> error', error);
    return error;
  }
}

async function saveMp3(music) {
  const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

  const output_dir = isDev
    ? path.join(path.resolve('./') + '/datas/audio')
    : path.join(path.resolve('/home/debian/www/blindtus/api/datas/audio'));

  const { id, timecode } = youtube_parser(music.video);
  const audio_name = slug(`${music.author}-${music.title}-${id}`);
  const start = Date.now();

  const info = await ytdl.getInfo(music.video);
  const formats = info.formats.filter(f => f.container === 'mp4' && f.hasAudio);

  const stream = ytdl(id, {
    quality: formats[0].itag,
  });

  return new Promise((resolve, reject) => {
    ffmpeg(stream)
      .audioBitrate(128)
      .save(`${output_dir}/${audio_name}.mp3`)
      .on('progress', p => {
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${p.targetSize}kb downloaded`);
      })
      .on('error', function (err, stdout, sterr) {
        // console.log('>>> err', err)
        return reject(`error: ${music.author} - ${music.title} can't be saved !`);
      })
      .on('end', async () => {
        console.log(`\ndone, ${music.author} / ${music.title} --- ${(Date.now() - start) / 1000}s`);
        await patchMusic(music._id, {
          timecode: timecode || 0,
          audio_name,
        });

        resolve(`${music.author} - ${music.title} saved`);
      });
  });
}