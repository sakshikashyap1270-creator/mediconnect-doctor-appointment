import { NotificationModel } from '../models/Notification.js';

export const getNotifications = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const list = await NotificationModel.findByUserId(userId);
    res.status(200).json(list);
  } catch (error) {
    next(error);
  }
};

export const markNotificationsRead = async (req, res, next) => {
  const userId = req.user.id;

  try {
    await NotificationModel.markRead(userId);
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
