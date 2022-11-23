import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import readline from 'readline';
import ytdl from 'ytdl-core';
import slug from 'slug';
import { MusicsModel, MoviesModel, TVShowsModel } from '../models';
import * as Categories from './categoriesController';
import * as Movies from './moviesController';
import * as TVShows from './tvShowsController';
import { createNewEntity, mergeEntity } from '../utils/modelUtils';
import { errorMessages } from '../utils/errorUtils';
import { shuffle } from '../utils/arrayUtils';
import { youtube_parser } from '../utils/stringsUtils';

export async function getMusics(
  limit = 10,
  withProposals = false,
  noShuffle = false,
  addNotVerified = false,
  categories = []
) {
  let query = {};

  if (!addNotVerified) {
    query.verified = true;
  }

  if (categories.length) {
    query.category = { $in: categories };
  }

  try {
    const musics = await MusicsModel.find(query)
      .populate('movie')
      .populate('tvShow');

    let shuffleMusics = musics;

    if (!noShuffle) {
      shuffleMusics = shuffle(musics).slice(0, limit <= 0 ? undefined : limit);
    } else {
      shuffleMusics = shuffleMusics.slice(0, limit <= 0 ? undefined : limit);
    }

    let returnedMusics = [];

    if (withProposals) {
      const movies = await MoviesModel.find();
      const tvShows = await TVShowsModel.find();

      shuffleMusics.map((music) => {
        if (music.movie) {
          const moviesGenres = music.movie.genres;
          let moviesSameGenre = movies.filter((mo) => {
            if (mo.title_fr === music.movie.title_fr) {
              return;
            }
            return mo.genres.find((g) => g === moviesGenres[0]);
          });

          const shuffledMovies = shuffle(movies);
          if (moviesSameGenre.length < 10) {
            const limit = moviesSameGenre.length;
            for (let i = 0; i < 10 - limit; i++) {
              let isOk = false;
              while (!isOk) {
                for (let y = 0; y < shuffledMovies.length; y++) {
                  if (
                    shuffledMovies[y].title_fr !== music.movie.title_fr &&
                    !moviesSameGenre.some(
                      (m) => m.title_fr === shuffledMovies[y].title_fr
                    )
                  ) {
                    moviesSameGenre.push(shuffledMovies[y]);
                    isOk = true;
                    break;
                  }
                }

                isOk = true;
              }
            }
          }

          const musicProposals = shuffle(moviesSameGenre)
            .slice(0, 10)
            .map(({ title_fr }) => title_fr);
          music.proposals = musicProposals;
          returnedMusics.push(music);
        } else if (music.tvShow) {
          const tvShowsGenres = music.tvShow.genres;
          let tvShowsSameGenres = tvShows.filter((mo) => {
            if (mo.title_fr === music.tvShow.title_fr) {
              return;
            }
            return mo.genres.find((g) => g === tvShowsGenres[0]);
          });

          const shuffledTVShows = shuffle(tvShows);
          if (tvShowsSameGenres.length < 10) {
            const limit = tvShowsSameGenres.length;
            for (let i = 0; i < 10 - limit; i++) {
              let isOk = false;
              while (!isOk) {
                for (let y = 0; y < shuffledTVShows.length; y++) {
                  if (
                    shuffledTVShows[y].title_fr !== music.tvShow.title_fr &&
                    !tvShowsSameGenres.some(
                      (m) => m.title_fr === shuffledTVShows[y].title_fr
                    )
                  ) {
                    tvShowsSameGenres.push(shuffledTVShows[y]);
                    isOk = true;
                    break;
                  }
                }

                isOk = true;
              }
            }
          }

          const musicProposals = shuffle(tvShowsSameGenres)
            .slice(0, 10)
            .map(({ title_fr }) => title_fr);
          music.proposals = musicProposals;
          returnedMusics.push(music);
        }
      });
    }

    return returnedMusics.length > 0 ? returnedMusics : shuffleMusics;
  } catch (error) {
    return error;
  }
}

export async function pathAll() {
  try {
    await MusicsModel.updateMany(
      {},
      { $set: { category: ['626962053dcb17a8995789a1'] } }
    );
    return 'ok';
  } catch (error) {
    return error;
  }
}

export async function getMusic(musicId, withProposals = false) {
  if (!musicId) {
    return errorMessages.generals.missingId;
  }

  try {
    const music = await MusicsModel.findById(musicId)
      .populate('movie')
      .populate('tvShow');

    let returnedMusic = null;
    if (withProposals) {
      const movies = await MoviesModel.find();
      const moviesGenres = music.movie.genres;
      let moviesSameGenre = movies.filter((mo) => {
        if (mo.title_fr === music.movie.title_fr) {
          return;
        }
        return mo.genres.find((g) => g === moviesGenres[0]);
      });

      const shuffledMovies = shuffle(movies);
      if (moviesSameGenre.length < 10) {
        const limit = moviesSameGenre.length;
        for (let i = 0; i < 10 - limit; i++) {
          let isOk = false;
          while (!isOk) {
            for (let y = 0; y < shuffledMovies.length; y++) {
              if (
                shuffledMovies[y].title_fr !== music.movie.title_fr &&
                !moviesSameGenre.some(
                  (m) => m.title_fr === shuffledMovies[y].title_fr
                )
              ) {
                moviesSameGenre.push(shuffledMovies[y]);
                isOk = true;
                break;
              }
            }
          }
        }
      }

      const musicProposals = shuffle(moviesSameGenre)
        .slice(0, 10)
        .map(({ title_fr }) => title_fr);
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
    if (music.movie) {
      await Movies.addMusicById(music.movie._id, music._id);
    } else if (music.tvShow) {
      await TVShows.addMusicById(music.tvShow._id, music._id);
    }
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
  await new Promise((resolve) => setTimeout(resolve, stallTime));
}

export async function extractMp3(limit = 50) {
  const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

  const output_dir = isDev
    ? path.join(path.resolve('./') + '/datas/audio')
    : path.join(path.resolve('/home/debian/www/blindtus/api/datas/audio'));

  try {
    const musics = await MusicsModel.find();
    for (const music of musics) {
      const { id, timecode } = youtube_parser(music.video);
      const start = Date.now();
      const audio_name = slug(`${music.author}-${music.title}-${id}`);

      if (!fs.existsSync(`${output_dir}/${audio_name}.mp3`)) {
        const info = await ytdl.getInfo(music.video);
        const formats = info.formats.filter(
          (f) => f.container === 'mp4' && f.hasAudio
        );

        const stream = ytdl(id, {
          quality: formats[0].itag,
        });

        ffmpeg(stream)
          .audioBitrate(formats[0].audioBitrate)
          .save(`${output_dir}/${audio_name}.mp3`)
          .on('progress', (p) => {
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`${p.targetSize}kb downloaded`);
          })
          .on('error', function (err, stdout, sterr) {
            console.log('>>> error', err, music.author, music.title);
          })
          .on('end', async () => {
            console.log(
              `\ndone, ${music.author} / ${music.title} --- ${
                (Date.now() - start) / 1000
              }s`
            );
            await patchMusic(music._id, {
              timecode,
              audio_name,
            });
          });

        await stall(100);
      }
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
  const formats = info.formats.filter(
    (f) => f.container === 'mp4' && f.hasAudio
  );

  const stream = ytdl(id, {
    quality: formats[0].itag,
  });

  return new Promise((resolve, reject) => {
    ffmpeg(stream)
      .audioBitrate(128)
      .save(`${output_dir}/${audio_name}.mp3`)
      .on('progress', (p) => {
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${p.targetSize}kb downloaded`);
      })
      .on('error', function (err, stdout, sterr) {
        // console.log('>>> err', err)
        return reject(
          `error: ${music.author} - ${music.title} can't be saved !`
        );
      })
      .on('end', async () => {
        console.log(
          `\ndone, ${music.author} / ${music.title} --- ${
            (Date.now() - start) / 1000
          }s`
        );
        await patchMusic(music._id, {
          timecode: timecode || 0,
          audio_name,
        });

        resolve(`${music.author} - ${music.title} saved`);
      });
  });
}
