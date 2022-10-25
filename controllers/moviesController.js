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
    return MoviesModel.findOne({
      title: movie_title,
      release_date: movie_date,
    });
  } catch (error) {
    return error;
  }
}

export async function saveMovie(movie, music) {
  let newMovie = movie;

  if (!newMovie.credits) {
    const dbMovie = await findMovieById(newMovie.id);
    newMovie.credits = dbMovie.credits;
    newMovie.genres = dbMovie.genres;
  }

  if (music) {
    newMovie.musics.push(music);
  }

  // Get directors
  const directors = newMovie.credits.crew.filter(
    (person) => person.job === 'Director'
  );
  newMovie.directors = [];

  directors.map((director) => {
    newMovie.directors.push(director.name);
  });

  newMovie.casts = [];
  newMovie.credits.cast.slice(0, 4).map((actor) => {
    newMovie.casts.push(actor.name);
  });

  // Get genres
  const genres = [];
  newMovie.genres.map((genre) => {
    genres.push(genre.name);
  });

  newMovie.genres = genres;

  newMovie.release_date = newMovie.release_date.slice(0, 4);
  newMovie.title_fr = newMovie.title;
  newMovie.title = newMovie.original_title;

  const savedMovie = createNewEntity(newMovie, MoviesModel);
  try {
    return await savedMovie.save();
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
  } catch (error) {
    return error;
  }
}

export async function findMovieById(id) {
  if (!id) {
    return errorMessages.generals.missingId;
  }

  try {
    const movie = await mdb.movieInfo({
      id: id,
      language: 'fr-FR',
      append_to_response: 'credits',
    });
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

export async function deleteMovie(movie_id) {
  if (!movie_id) {
    return errorMessages.generals.missingId;
  }

  try {
    const movie = await MoviesModel.findOneAndDelete({
      _id: movie_id,
    });

    if (!movie) {
      return errorMessages.movies.notFound;
    }

    return movie;
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

        movieFound.credits.cast.slice(0, 4).map((actor) => {
          movie.casts.push(actor.name);
        });

        await movie.save();
      }
    });

    return 'ok';
  } catch (error) {
    return error;
  }
}
