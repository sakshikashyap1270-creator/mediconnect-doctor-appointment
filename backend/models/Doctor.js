import prisma from '../config/db.js';

export const DoctorModel = {
  create: async (userId, specialization, experience, fee, location, licenseNumber, qualifications, bio) => {
    return prisma.doctor.create({
      data: {
        userId: parseInt(userId),
        specialization,
        experience: parseInt(experience),
        fee: parseFloat(fee),
        location,
        licenseNumber,
        status: 'pending',
        qualifications,
        bio
      }
    });
  },

  findById: async (id) => {
    const doc = await prisma.doctor.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    if (!doc) return null;
    return {
      ...doc,
      name: doc.user.name,
      email: doc.user.email
    };
  },

  findByUserId: async (userId) => {
    return prisma.doctor.findUnique({
      where: { userId: parseInt(userId) }
    });
  },

  findFiltered: async (filters = {}) => {
    const where = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.specialization) {
      where.specialization = filters.specialization;
    }
    if (filters.maxFee) {
      where.fee = {
        lte: parseFloat(filters.maxFee)
      };
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      where.OR = [
        {
          specialization: {
            contains: searchLower,
            mode: 'insensitive'
          }
        },
        {
          user: {
            name: {
              contains: searchLower,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    const docs = await prisma.doctor.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return docs.map(doc => ({
      ...doc,
      name: doc.user.name,
      email: doc.user.email
    }));
  },

  update: async (id, data) => {
    const updateData = {};
    const allowedFields = ['specialization', 'experience', 'fee', 'rating', 'location', 'status', 'qualifications', 'bio'];
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        if (key === 'experience') updateData[key] = parseInt(data[key]);
        else if (key === 'fee' || key === 'rating') updateData[key] = parseFloat(data[key]);
        else updateData[key] = data[key];
      }
    }

    return prisma.doctor.update({
      where: { id: parseInt(id) },
      data: updateData
    });
  },

  getSlots: async (doctorId, date) => {
    return prisma.timeSlot.findMany({
      where: {
        doctorId: parseInt(doctorId),
        date: new Date(date)
      },
      orderBy: {
        timeSlot: 'asc'
      }
    });
  },

  addSlot: async (doctorId, date, timeSlot) => {
    return prisma.timeSlot.upsert({
      where: {
        doctorId_date_timeSlot: {
          doctorId: parseInt(doctorId),
          date: new Date(date),
          timeSlot
        }
      },
      update: {},
      create: {
        doctorId: parseInt(doctorId),
        date: new Date(date),
        timeSlot,
        isBooked: false
      }
    });
  },

  removeSlot: async (doctorId, date, timeSlot) => {
    return prisma.timeSlot.deleteMany({
      where: {
        doctorId: parseInt(doctorId),
        date: new Date(date),
        timeSlot
      }
    });
  }
};
