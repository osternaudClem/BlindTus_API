import express from 'express';
import { body, validationResult } from 'express-validator';
import * as Users from '../controllers/usersController';
import { sendMail } from '../utils/mailUtils';
const router = express.Router();

/**
 * @api {get} /users Get all users
 * @apiVersion 0.0.1
 * @apiName GetUsers
 * @apiGroup Users
 *
 * @apiSuccess {Object[]} users
 *
 */
router.get('/', async (req, res) => {
  const { usernames } = req.query;
  return res.json(await Users.getUsers(usernames));
});

/**
 * @api {get} /users/:id Get single user
 * @apiVersion 0.0.1
 * @apiName GetUser
 * @apiGroup Users
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} user
 *
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const user = await Users.getUser(id);
  return res.json(user);
});

/**
 * @api {post} /users Create new user
 * @apiVersion 0.0.1
 * @apiName PostUsers
 * @apiGroup Users
 *
 * @apiSuccess {Object} user
 *
 */
router.post(
  '/',

  body('username').custom((value) => {
    if (!/^[a-z0-9]+$/i.test(value)) {
      throw new Error('The username can contain only letters and numbers.');
    }
    return true;
  }),

  body('email').isEmail().withMessage('Invalid e-mail'),

  body('password').custom((value) => {
    const uppercase = /[A-Z]+/;
    const lowercase = /[a-z]+/;
    const digit = /[0-9]+/;

    if (
      !uppercase.test(value) ||
      !lowercase.test(value) ||
      !digit.test(value) ||
      value.length < 8
    ) {
      throw new Error(
        'The password must be at least 8 characters long and contain uppercase and lowercase letters and digits.'
      );
    }

    return true;
  }),

  async (req, res, next) => {
    try {
      const validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
      }

      return res.json(await Users.postUser(req.body));
    } catch (error) {
      next(error);
    }
  }
);

/**
 *
 * @api {get} /confirm/:token Confirm user account
 * @apiName ConfirmUser
 * @apiGroup Users
 * @apiVersion  0.0.1
 *
 * @apiParam  {String} token
 *
 * @apiSuccess {Object} user
 */
router.post('/confirm', async (req, res) => {
  const { token } = req.body;

  return res.json(await Users.confirm(token));
});

/**
 * @api {post} /users Auth an user
 * @apiVersion 0.0.1
 * @apiName LoginUser
 * @apiGroup Users
 *
 * @apiParam {String} email
 * @apiParam {String} password
 *
 * @apiSuccess {Object} user
 *
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  return res.json(await Users.login(email, password));
});

/**
 * @api {patch} /users/changePassword/:id Update password
 * @apiVersion 0.0.1
 * @apiName PatchUsersPassword
 * @apiGroup Users
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} user
 *
 */
router.patch(
  '/changePassword/:id',
  body('newPassword').custom((value) => {
    const uppercase = /[A-Z]+/;
    const lowercase = /[a-z]+/;
    const digit = /[0-9]+/;

    if (
      !uppercase.test(value) ||
      !lowercase.test(value) ||
      !digit.test(value) ||
      value.length < 8
    ) {
      throw new Error(
        'The password must be at least 8 characters long and contain uppercase and lowercase letters and digits.'
      );
    }

    return true;
  }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
      }

      return res.json(await Users.updatePassword(id, req.body));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @api {patch} /users/:id Update an user
 * @apiVersion 0.0.1
 * @apiName PatchUsers
 * @apiGroup Users
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} user
 *
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    return res.json(await Users.patchUser(id, req.body));
  } catch (error) {
    next(error);
  }
});

/**
 * @api {delete} /users/:id Delete an user
 * @apiVersion 0.0.1
 * @apiName DeleteUsers
 * @apiGroup Users
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} user
 *
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  return res.json(await Users.deleteUser(id));
});

router.get('/ask-new-password/:email', async (req, res) => {
  const { email } = req.params;

  return res.json(await Users.askNewPassword(email));
});

router.post('/save-new-password', async (req, res) => {
  const { token, password } = req.body;

  return res.json(await Users.saveNewPassword(token, password));
});

router.post('/test/send-test', async (req, res) => {
  sendMail(
    'Confirmez votre e-mail',
    {
      email: 'osternaud.clement@gmail.com',
      username: 'Cl3tus',
      token: 'ewfwefwefwefwfe',
    },
    'newpassword'
  );

  return res.json('send test email');
});

module.exports = router;
