import { MovieDb } from 'moviedb-promise';
import { MoviesModel } from '../models';
import { createNewEntity, mergeEntity } from '../utils/modelUtils';
import { errorMessages } from '../utils/errorUtils';
import dotenv from 'dotenv';
dotenv.config();
const mdb = new MovieDb(process.env.THEMOVIEDB_KEY);

export async function getMovies(filter) {
  try {
    return await MoviesModel.find(filter).populate('added_by');
  } catch (error) {
    return error;
  }
}

export async function getMovie(movieId) {
  if (!movieId) {
    return errorMessages.generals.missingId;
  }

  try {
    const movie = await MoviesModel.findById(movieId).populate('musics');

    if (!movie) {
      return errorMessages.movies.notFound;
    }

    return movie;
  } catch (error) {
    return error;
  }
}

export async function getMovieByTitleAndDate(movie_title, movie_date) {
  if (!movie_title) {
    return;
  }

  if (!movie_date) {
    return;
  }

  try {
    return MoviesModel.findOne({ title: movie_title, release_date: movie_date });
  } catch (error) {
    return error;
  }
}

export async function saveMovie(movie, music) {
  if (music) {
    movie.musics.push(music);
  }

  // Get directors
  const directors = movie.credits.crew.filter(person => person.job === 'Director');
  movie.directors = [];

  directors.map(director => {
    movie.directors.push(director.name);
  });

  movie.casts = [];
  movie.credits.cast.slice(0, 4).map(actor => {
    movie.casts.push(actor.name);
  });

  // Get genres
  const genres = [];
  movie.genres.map(genre => {
    genres.push(genre.name);
  });

  movie.genres = genres;

  movie.release_date = movie.release_date.slice(0, 4);
  movie.title_fr = movie.title;
  movie.title = movie.original_title;

  const newMovie = createNewEntity(movie, MoviesModel);

  try {
    return await newMovie.save();
  } catch (error) {
    return error;
  }
}

export async function findMovies(title) {
  if (!title) {
    return 'The title is missing';
  }

  try {
    const movies = await mdb.searchMovie({ query: title, language: 'fr-FR' });
    return movies;
  }
  catch (error) {
    return error;
  }
}

export async function findMovieById(id) {
  if (!id) {
    return errorMessages.generals.missingId;
  }

  try {
    const movie = await mdb.movieInfo({ id: id, language: 'fr-FR', append_to_response: 'credits' });
    return movie;
  } catch (error) {
    return error;
  }
}

export async function updateMovie(movieId, updatedAttributes) {
  if (!movieId) {
    return errorMessages.generals.missingId;
  }

  try {
    const movie = await MoviesModel.findById(movieId);

    if (!movie) {
      return errorMessages.movies.notFound;
    }

    const updatedMovie = mergeEntity(updatedAttributes, MoviesModel);

    for (const key in updatedMovie) {
      movie[key] = updatedMovie[key];
    }

    return await movie.save();
  } catch (error) {
    return error;
  }
}

export async function addMusicById(movie_id, music_id) {
  if (!movie_id) {
    return;
  }

  if (!music_id) {
    return;
  }

  try {
    const movie = await MoviesModel.findById(movie_id);
    movie.musics.push(music_id);

    return movie.save();
  } catch (error) {
    return error;
  }
}

export async function addCasts() {
  try {
    const movies = await MoviesModel.find();
    movies.map(async (movie, index) => {
      const movieFound = await findMovieById(movie.imdb_id);

      if (!movie.casts || !movie.casts.length) {
        movie.casts = [];
        movieFound.credits.cast.slice(0, 4).map(actor => {
          movie.casts.push(actor.name);
        });
        await movie.save();
        console.log('>>> movie:', index, movieFound.title)
      }
    });

    return 'ok'
  } catch (error) {
    return error;
  }
}