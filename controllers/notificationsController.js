import { NotificationsModel, UsersModel } from '../models';
import { createNewEntity, mergeEntity } from '../utils/modelUtils';
import { errorMessages } from '../utils/errorUtils';

export async function getNotifications(filter) {
  try {
    return await NotificationsModel.find(filter);
  } catch (error) {
    return error;
  }
}

export async function getNotification(id) {
  if (!id) {
    return errorMessages.generals.missingId;
  }

  try {
    const notification = await NotificationsModel.findById(id);

    if (!tvShow) {
      return errorMessages.notifications.notFound;
    }

    return notification;
  } catch (error) {
    return error;
  }
}

export async function getByUser(user_id) {
  if (!user_id) {
    return errorMessages.generals.missingId;
  }

  try {
    const user = await UsersModel.findById(user_id);

    if (!user) {
      return error.user.notFound;
    }

    const notifications = await NotificationsModel.find({
      created_at: {
        $gte: user.created_at,
      },
      active: true,
    });

    return notifications.reverse();
  } catch (error) {
    return error;
  }
}

export async function saveNotification(notification) {
  const newNotification = createNewEntity(notification, NotificationsModel);
  try {
    return await newNotification.save();
  } catch (error) {
    return error;
  }
}

export async function updateNotification(notificationId, updatedAttributes) {
  if (!notificationId) {
    return errorMessages.generals.missingId;
  }

  try {
    const notification = await NotificationsModel.findById(notificationId);

    if (!notification) {
      return errorMessages.notifications.notFound;
    }

    const updatedNotification = mergeEntity(
      updatedAttributes,
      NotificationsModel
    );

    for (const key in updatedNotification) {
      notification[key] = updatedNotification[key];
    }

    return await notification.save();
  } catch (error) {
    return error;
  }
}

export async function deleteNotification(id) {
  if (!id) {
    return errorMessages.generals.missingId;
  }

  try {
    const notification = await NotificationsModel.findOneAndDelete({
      _id: id,
    });

    if (!notification) {
      return errorMessages.notifications.notFound;
    }

    return notification;
  } catch (error) {
    return error;
  }
}

export async function markAsRead(notificationId, userId) {
  if (!notificationId || !userId) {
    return errorMessages.generals.missingId;
  }

  try {
    const notification = await NotificationsModel.findById(notificationId);

    if (!notification) {
      return errorMessages.notifications.notFound;
    }

    const user = await UsersModel.findById(userId);

    if (!user) {
      return errorMessages.users.notFound;
    }

    if (notification.users.includes(userId)) {
      return notification;
    }

    notification.users.push(userId);
    notification.save();

    return await NotificationsModel.getByUser(userId);
  } catch (error) {
    return error;
  }
}
