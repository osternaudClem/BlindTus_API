import express from 'express';
import * as TVShows from '../controllers/tvShowsController';
const router = express.Router();

/**
 * @api {get} /tv-shows Get all tv shows
 * @apiVersion 0.0.1
 * @apiName GetTVShows
 * @apiGroup TV Shows
 *
 * @apiSuccess {Object[]} tv shows
 *
 */
router.get('/', async (req, res) => {
  const filter = req.query;
  return res.json(await TVShows.getTVShows(filter));
});

router.patch('/', async (req, res) => {
  return res.json(await TVShows.getNetwork());
});

/**
 * @api {get} /tv-shows/:id Get single tv show
 * @apiVersion 0.0.1
 * @apiName GetTVShow
 * @apiGroup TV Shows
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} tv show
 *
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  return res.json(await TVShows.getTVShow(id));
});

/**
 * @api {get} /tv-shows/find/:query Search TV Shows from TheMovieDB API
 * @apiVersion 0.0.1
 * @apiName FindTVShows
 * @apiGroup TV Shows
 *
 * @apiParam (Params) {String} query
 *
 * @apiSuccess {Object} tv shows
 *
 */
router.get('/find/:query', async (req, res) => {
  const { query } = req.params;
  return res.json(await TVShows.findTVShow(query));
});

/**
 * @api {get} /tv-show/find/:id Get single TV Show from TheMovieDB API
 * @apiVersion 0.0.1
 * @apiName FindTVShowById
 * @apiGroup TV Shows
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} tv show
 *
 */
router.get('/find/id/:show_id', async (req, res) => {
  const { show_id } = req.params;
  return res.json(await TVShows.findTVShowsById(show_id));
});

/**
 * @api {post} /tv-shows Save tv show
 * @apiVersion 0.0.1
 * @apiName PostTVShow
 * @apiGroup TV Shows
 *
 * @apiSuccess {Object} tv show
 *
 */
router.post('/', async (req, res) => {
  const { tvShow } = req.body;

  return res.json(await TVShows.saveTVShow(tvShow));
});

/**
 * @api {patch} /tv-shows/:id Update tv show
 * @apiVersion 0.0.1
 * @apiName PatchTVShow
 * @apiGroup TV Shows
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} tv show
 *
 */
router.patch('/:show_id', async (req, res) => {
  const { show_id } = req.params;
  const { music_id, tvShow } = req.body;
  if (tvShow.title) {
    return res.json(await TVShows.updateTVShow(show_id, tvShow));
  }

  if (music_id) {
    return res.json(await TVShows.addMusicById(show_id, music_id));
  }

  return res.json({});
});

/**
 * @api {delete} /tv-shows/:id Delete single tv show
 * @apiVersion 0.0.1
 * @apiName DeleteTVShow
 * @apiGroup TV Shows
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} tv show
 *
 */
router.delete('/:show_id', async (req, res) => {
  const { show_id } = req.params;

  return res.json(await TVShows.deleteTVShow(show_id));
});

module.exports = router;
