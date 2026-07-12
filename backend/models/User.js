import prisma from '../config/db.js';

export const UserModel = {
  create: async (email, passwordHash, role, name) => {
    return prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role,
        name
      }
    });
  },

  findByEmail: async (email) => {
    return prisma.user.findUnique({
      where: { email }
    });
  },

  findById: async (id) => {
    return prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true
      }
    });
  },

  updatePassword: async (id, passwordHash) => {
    return prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: passwordHash }
    });
  }
};
