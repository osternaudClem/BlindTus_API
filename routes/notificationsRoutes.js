import express from 'express';
import * as Notifications from '../controllers/notificationsController';
const router = express.Router();

/**
 * @api {get} /notifications Get all notifications
 * @apiVersion 0.0.1
 * @apiName GetNotifications
 * @apiGroup Notifications
 *
 * @apiSuccess {Object[]} notifications
 *
 */
router.get('/', async (req, res) => {
  const filter = req.query;
  return res.json(await Notifications.getNotifications(filter));
});

/**
 * @api {get} /notifications/:id Get single notification
 * @apiVersion 0.0.1
 * @apiName GetNotification
 * @apiGroup Notifications
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} notification
 *
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  return res.json(await Notifications.getNotification(id));
});

/**
 * @api {get} /notifications/user/:user_id Get notifications for a user
 * @apiVersion 0.0.1
 * @apiName GetNotificationsByUser
 * @apiGroup Notifications
 *
 * @apiParam (Params) {String} user_id
 *
 * @apiSuccess {Object} notifications
 *
 */
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;
  return res.json(await Notifications.getByUser(user_id));
});

/**
 * @api {post} /notifications Save notification
 * @apiVersion 0.0.1
 * @apiName PostNotification
 * @apiGroup Notifications
 *
 * @apiSuccess {Object} notification
 *
 */
router.post('/', async (req, res) => {
  const { notification } = req.body;

  return res.json(await Notifications.saveNotification(notification));
});

/**
 * @api {patch} /notification/mark-as-read Mark as read a notification
 * @apiVersion 0.0.1
 * @apiName MarkAsRead
 * @apiGroup Notifications
 *
 * @apiParam (Params) {String} notification_id
 * @apiParam (Params) {String} user_id
 *
 * @apiSuccess {Object} notification
 *
 */
router.patch('/mark-as-read', async (req, res) => {
  const { notification_id, user_id } = req.body;

  return res.json(await Notifications.markAsRead(notification_id, user_id));
});

/**
 * @api {patch} /notifications/:id Update single notification
 * @apiVersion 0.0.1
 * @apiName PatchNotification
 * @apiGroup Notifications
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} notification
 *
 */
router.patch('/:notification_id', async (req, res) => {
  const { notification_id } = req.params;
  const { notification } = req.body;

  return res.json(
    await Notifications.updateNotification(notification_id, notification)
  );
});

/**
 * @api {delete} /notification/:id Delete single notification
 * @apiVersion 0.0.1
 * @apiName DeleteNotification
 * @apiGroup Notifications
 *
 * @apiParam (Params) {String} id
 *
 * @apiSuccess {Object} notification
 *
 */
router.delete('/:notification_id', async (req, res) => {
  const { notification_id } = req.params;

  return res.json(await Notifications.deleteNotification(notification_id));
});

module.exports = router;
