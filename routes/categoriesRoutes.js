import express from 'express';
import * as Categories from '../controllers/categoriesController';
const router = express.Router();

/**
 * @api {get} /categories Get all categories
 * @apiVersion 0.0.1
 * @apiName GetCategories
 * @apiGroup Categories
 *
 * @apiSuccess {Object[]} categories
 *
 */
router.get('/', async (req, res) => {
  return res.json(await Categories.getCategories());
});

/**
 * @api {get} /categories/:id Get single category
 * @apiVersion 0.0.1
 * @apiName GetCategory
 * @apiGroup Categories
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} category
 *
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  return res.json(await Categories.getCategory(id));
});

/**
 * @api {post} /categories Create new categorie
 * @apiVersion 0.0.1
 * @apiName PostCategories
 * @apiGroup Categories
 *
 * @apiSuccess {Object} category
 *
 */
router.post('/', async (req, res) => {
  return res.json(await Categories.postCategory(req.body));
});

/**
 * @api {patch} /categories/:id Update a categorie
 * @apiVersion 0.0.1
 * @apiName PatchCategories
 * @apiGroup Categories
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} category
 *
 */
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  return res.json(await Categories.patchCategory(id, req.body));
});

/**
 * @api {post} /categories/:id Delete a categorie
 * @apiVersion 0.0.1
 * @apiName DeleteCategories
 * @apiGroup Categories
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} category
 *
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  return res.json(await Categories.deleteCategory(id));
});

module.exports = router;
