import express from 'express';
import * as Movies from '../controllers/moviesController';
const router = express.Router();

/**
 * @api {get} /movies Get all movies
 * @apiVersion 0.0.1
 * @apiName GetMovies
 * @apiGroup Movies
 *
 * @apiSuccess {Object[]} movies
 *
 */
router.get('/', async (req, res) => {
  const filter = req.query;
  return res.json(await Movies.getMovies(filter));
});

/**
 * @api {get} /movies/:id Get single movie
 * @apiVersion 0.0.1
 * @apiName GetMovie
 * @apiGroup Movies
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} movie
 *
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  return res.json(await Movies.getMovie(id));
});

/**
 * @api {get} /movies/find/:query Search movies from TheMovieDB API
 * @apiVersion 0.0.1
 * @apiName FindMovies
 * @apiGroup Movies
 *
 * @apiParam (Params) {String} query
 *
 * @apiSuccess {Object} movies
 *
 */
router.get('/find/:query', async (req, res) => {
  const { query } = req.params;
  return res.json(await Movies.findMovies(query));
});

/**
 * @api {get} /movies/find/:id Get single movie from TheMovieDB API
 * @apiVersion 0.0.1
 * @apiName FindMovieById
 * @apiGroup Movies
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} movie
 *
 */
router.get('/find/id/:movie_id', async (req, res) => {
  const { movie_id } = req.params;
  return res.json(await Movies.findMovieById(movie_id));
});

/**
 * @api {post} /movies Save movie
 * @apiVersion 0.0.1
 * @apiName PostMovie
 * @apiGroup Movies
 *
 * @apiSuccess {Object} movie
 *
 */
router.post('/', async (req, res) => {
  const { movie } = req.body;

  return res.json(await Movies.saveMovie(movie));
});

/**
 * @api {patch} /movies/:id Update single movie
 * @apiVersion 0.0.1
 * @apiName PatchMovie
 * @apiGroup Movies
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} movie
 *
 */
router.patch('/:movie_id', async (req, res) => {
  const { movie_id } = req.params;
  const { music_id, movie } = req.body;

  if (movie.title) {
    return res.json(await Movies.updateMovie(movie_id, movie));
  }

  return res.json(await Movies.addMusicById(movie_id, music_id));
});

/**
 * @api {delete} /movies/:id Delete single movie
 * @apiVersion 0.0.1
 * @apiName DeleteMovie
 * @apiGroup Movies
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} movie
 *
 */
router.delete('/:movie_id', async (req, res) => {
  const { movie_id } = req.params;

  return res.json(await Movies.deleteMovie(movie_id));
});

router.post('/update-movies', async (req, res) => {
  return res.json(await Movies.addCasts());
});

module.exports = router;
