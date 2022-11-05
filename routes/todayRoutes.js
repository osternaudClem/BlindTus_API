import express from 'express';
import * as Today from '../controllers/todayController';
const router = express.Router();

/**
 * @api {get} /musicday Get all musics of the day
 * @apiVersion 0.0.1
 * @apiName GetMusics
 * @apiGroup MusicsOfTheDay
 *
 * @apiSuccess {Object[]} musics
 *
 */
router.get('/', async (req, res) => {
  return res.json(await Today.getMusics());
});

/**
 * @api {get} /musicday Get all musics of the day
 * @apiVersion 0.0.1
 * @apiName GetMusics
 * @apiGroup MusicsOfTheDay
 *
 * @apiSuccess {Object[]} musics
 *
 */
router.get('/today', async (req, res) => {
  return res.json(await Today.getMusic());
});

router.post('/', async (req, res) => {
  return res.json(await Today.postMusic(req.body));
});

module.exports = router;
