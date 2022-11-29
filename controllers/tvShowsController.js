import { MovieDb } from 'moviedb-promise';
import { TVShowsModel } from '../models';
import { createNewEntity, mergeEntity } from '../utils/modelUtils';
import { errorMessages } from '../utils/errorUtils';
import dotenv from 'dotenv';
dotenv.config();
const mdb = new MovieDb(process.env.THEMOVIEDB_KEY);

export async function getTVShows(filter) {
  try {
    return await TVShowsModel.find(filter)
      .populate('added_by')
      .populate('category');
  } catch (error) {
    return error;
  }
}

export async function getTVShow(id) {
  if (!id) {
    return errorMessages.generals.missingId;
  }

  try {
    const tvShow = await TVShowsModel.findById(id)
      .populate('musics')
      .populate('forcePropositions');

    if (!tvShow) {
      return errorMessages.tvShow.notFound;
    }

    return tvShow;
  } catch (error) {
    return error;
  }
}

export async function saveTVShow(tvShow, music) {
  if (!tvShow.credits) {
    const dbMovie = await findTVShowsById(tvShow.id);
    tvShow = { ...tvShow, ...dbMovie };
  }

  if (music) {
    tvShow.musics.push(music);
  }

  tvShow.casts = [];
  tvShow.credits.cast.slice(0, 4).map((actor) => {
    tvShow.casts.push(actor.name);
  });

  // Get genres
  const genres = [];
  tvShow.genres.map((genre) => {
    genres.push(genre.name);
  });

  tvShow.genres = genres;

  // Get networks
  const networks = [];
  tvShow.networks.map((network) => {
    networks.push(network.name);
  });

  tvShow.networks = networks;

  tvShow.title_fr = tvShow.name;
  tvShow.title = tvShow.original_name;
  tvShow.first_air_date = parseInt(tvShow.first_air_date.slice(0, 4));
  tvShow.last_air_date = parseInt(tvShow.last_air_date.slice(0, 4));
  tvShow.mdb_id = parseInt(tvShow.id);

  const savedTVShow = createNewEntity(tvShow, TVShowsModel);
  try {
    return await savedTVShow.save();
  } catch (error) {
    console.log('>>> error', error);
    return error;
  }
}

export async function findTVShow(title) {
  if (!title) {
    return 'The title is missing';
  }

  try {
    const shows = await mdb.searchTv({
      query: title,
      language: 'fr-FR',
      append_to_response: 'number_of_seasons',
    });
    return shows;
  } catch (error) {
    return error;
  }
}

export async function findTVShowsById(id) {
  if (!id) {
    return errorMessages.generals.missingId;
  }

  try {
    const show = await mdb.tvInfo({
      id: id,
      language: 'fr-FR',
      append_to_response: 'credits',
    });
    return show;
  } catch (error) {
    return error;
  }
}

export async function updateTVShow(showId, updatedAttributes) {
  if (!showId) {
    return errorMessages.generals.missingId;
  }

  try {
    const tvShow = await TVShowsModel.findById(showId);

    if (!tvShow) {
      return errorMessages.tvShows.notFound;
    }

    const updatedTVShow = mergeEntity(updatedAttributes, TVShowsModel);

    for (const key in updatedTVShow) {
      tvShow[key] = updatedTVShow[key];
    }

    return await tvShow.save();
  } catch (error) {
    return error;
  }
}

export async function deleteTVShow(id) {
  if (!id) {
    return errorMessages.generals.missingId;
  }

  try {
    const tvShow = await TVShowsModel.findOneAndDelete({
      _id: id,
    });

    if (!tvShow) {
      return errorMessages.tvShows.notFound;
    }

    return tvShow;
  } catch (error) {
    return error;
  }
}

export async function addMusicById(show_id, music_id) {
  if (!show_id) {
    return;
  }

  if (!music_id) {
    return;
  }

  try {
    const tvShow = await TVShowsModel.findById(show_id);
    tvShow.musics.push(music_id);

    return tvShow.save();
  } catch (error) {
    return error;
  }
}

export async function getNetwork() {
  const tvShows = await TVShowsModel.find();

  tvShows.map(async (tvShow) => {
    const shows = await mdb.searchTv({
      query: tvShow.title,
      language: 'fr-FR',
    });

    await updateTVShow(tvShow._id, { mdb_id: parseInt(shows.results[0].id) });
  });

  return 'ok';
}
