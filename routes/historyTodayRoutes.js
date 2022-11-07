import express from 'express';
import * as HistoryToday from '../controllers/historyTodayController';
const router = express.Router();

/**
 * @api {get} /historytoday Get all history
 * @apiVersion 0.0.1
 * @apiName GetAllHistory
 * @apiGroup HistoryToday
 *
 * @apiSuccess {Object[]} history
 *
 */
router.get('/', async (req, res) => {
  return res.json(await HistoryToday.getAllHistory());
});

/**
 * @api {get} /historytoday/:id Get single history
 * @apiVersion 0.0.1
 * @apiName GetHistory
 * @apiGroup HistoryToday
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} history
 *
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  return res.json(await HistoryToday.getHistory(id));
});

router.get('/user/today/:user_id', async (req, res) => {
  const { user_id } = req.params;
  return res.json(await HistoryToday.getTodayUser(user_id));
});

router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;
  return res.json(await HistoryToday.getHistoryByUser(user_id));
});

/**
 * @api {post} /historytoday Create or update history
 * @apiVersion 0.0.1
 * @apiName PostHistory
 * @apiGroup HistoryToday
 *
 * @apiSuccess {Object} history
 *
 */
router.post('/', async (req, res) => {
  return res.json(await HistoryToday.saveHistory(req.body));
});

module.exports = router;
