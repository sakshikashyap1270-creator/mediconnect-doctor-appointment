import prisma from '../config/db.js';

export const sendMessage = async (req, res, next) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.id;

  try {
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }

    const msg = await prisma.message.create({
      data: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        content
      }
    });

    res.status(201).json(msg);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: parseInt(currentUserId), receiverId: parseInt(userId) },
          { senderId: parseInt(userId), receiverId: parseInt(currentUserId) }
        ]
      },
      orderBy: {
        sentAt: 'asc'
      }
    });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

export const getChatContacts = async (req, res, next) => {
  const currentUserId = req.user.id;

  try {
    const sent = await prisma.message.findMany({
      where: { senderId: parseInt(currentUserId) },
      select: { receiverId: true }
    });

    const received = await prisma.message.findMany({
      where: { receiverId: parseInt(currentUserId) },
      select: { senderId: true }
    });

    const contactIds = [...new Set([
      ...sent.map(s => s.receiverId),
      ...received.map(r => r.senderId)
    ])];

    const contacts = await prisma.user.findMany({
      where: { id: { in: contactIds } },
      select: { id: true, name: true, email: true, role: true }
    });

    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};
