import prisma from '../config/db.js';

export const NotificationModel = {
  create: async (userId, message) => {
    return prisma.notification.create({
      data: {
        userId: parseInt(userId),
        message,
        isRead: false
      }
    });
  },

  findByUserId: async (userId) => {
    return prisma.notification.findMany({
      where: { userId: parseInt(userId) },
      orderBy: [
        { date: 'desc' },
        { id: 'desc' }
      ]
    });
  },

  markRead: async (userId) => {
    return prisma.notification.updateMany({
      where: { userId: parseInt(userId) },
      data: { isRead: true }
    });
  }
};
