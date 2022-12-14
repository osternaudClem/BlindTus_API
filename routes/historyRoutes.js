import express from 'express';
import * as History from '../controllers/historyController';
const router = express.Router();

/**
 * @api {get} /history Get all history
 * @apiVersion 0.0.1
 * @apiName GetAllHistory
 * @apiGroup History
 *
 * @apiSuccess {Object[]} history
 *
 */
router.get('/', async (req, res) => {
  const { user } = req.query;
  return res.json(await History.getAllHistory(user));
});

/**
 * @api {get} /history/:id Get single history
 * @apiVersion 0.0.1
 * @apiName GetHistory
 * @apiGroup History
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} history
 *
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  return res.json(await History.getHistory(id));
});

/**
 * @api {post} /history Save history
 * @apiVersion 0.0.1
 * @apiName PostHistory
 * @apiGroup History
 *
 * @apiSuccess {Object} history
 *
 */
router.post('/', async (req, res) => {
  return res.json(await History.generateHistory(req.body));
});

module.exports = router;
