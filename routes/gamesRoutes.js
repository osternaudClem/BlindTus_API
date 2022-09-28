import express from 'express';
import * as Games from '../controllers/gamesController';
const router = express.Router();

/**
 * @api {get} /api/games Get all games
 * @apiVersion 0.0.1
 * @apiName GetGames
 * @apiGroup Games
 *
 * @apiSuccess {Object[]} games
 *
 */
router.get('/', async (req, res) => {
    return res.json(await Games.getGames());
});

/**
 * @api {get} /api/games/:id Get single game
 * @apiVersion 0.0.1
 * @apiName GetGame
 * @apiGroup Games
 *
 * @apiParam (Params) {String} id
 * 
 * @apiSuccess {Object} game
 *
 */
 router.get('/:id', async (req, res) => {
    const { id } = req.params;
    return res.json(await Games.getGame(id));
});

/**
 * @api {post} /api/games Generate new game
 * @apiVersion 0.0.1
 * @apiName PostGame
 * @apiGroup Games
 *
 * @apiSuccess {Object} game
 *
 */
 router.post('/', async (req, res) => {
    return res.json(await Games.generateNewGame(req.body));
});

module.exports = router;