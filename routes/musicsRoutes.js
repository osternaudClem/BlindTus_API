import express from 'express';
import * as Musics from '../controllers/musicsController';
import * as Movies from '../controllers/moviesController';
const router = express.Router();

/**
 * @api {get} /api/musics Get all musics
 * @apiVersion 0.0.1
 * @apiName GetMusics
 * @apiGroup Musics
 *
 * @apiSuccess {Object[]} musics
 *
 */
router.get('/', async (req, res) => {
  const {
    limit = 10,
    withProposals = false,
    noShuffle = false,
    addNotVerified = false,
  } = req.query;
  return res.json(
    await Musics.getMusics(limit, withProposals, noShuffle, addNotVerified)
  );
});

router.get('/extract/:musicId', async (req, res) => {
  const { musicId } = req.params;
  return res.json(await Musics.extractSingleMp3(musicId));
});

router.get('/extract', async (req, res) => {
  const { limit } = req.query;
  return res.json(await Musics.extractMp3(limit));
});

/**
 * @api {get} /api/musics/:id Get single music
 * @apiVersion 0.0.1
 * @apiName GetMusic
 * @apiGroup Musics
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} music
 *
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { withProposals = false } = req.query;

  return res.json(await Musics.getMusic(id, withProposals));
});

/**
 * @api {post} /api/musics Create new music
 * @apiVersion 0.0.1
 * @apiName PostMusics
 * @apiGroup Musics
 *
 * @apiSuccess {Object} music
 *
 */
router.post('/', async (req, res) => {
  const { music } = req.body;

  try {
    const savedMusic = await Musics.postMusic(music);
    await Movies.addMusicById(music.movie, savedMusic._id);
    return res.json(savedMusic);
  } catch (error) {
    return res.json(error);
  }
});

/**
 * @api {patch} /api/musics/:id Update a music
 * @apiVersion 0.0.1
 * @apiName PatchMusics
 * @apiGroup Musics
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} music
 *
 */
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  return res.json(await Musics.patchMusic(id, req.body));
});

/**
 * @api {post} /api/musics/:id Delete a music
 * @apiVersion 0.0.1
 * @apiName DeleteMusics
 * @apiGroup Musics
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} music
 *
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  return res.json(await Musics.deleteMusic(id));
});

module.exports = router;
