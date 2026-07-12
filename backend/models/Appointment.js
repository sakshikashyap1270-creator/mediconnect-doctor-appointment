import prisma from '../config/db.js';

export const AppointmentModel = {
  create: async (patientId, doctorId, timeSlotId, date, fee) => {
    return prisma.$transaction(async (tx) => {
      // Mark slot as booked
      await tx.timeSlot.update({
        where: { id: parseInt(timeSlotId) },
        data: { isBooked: true }
      });

      // Create appointment
      return tx.appointment.create({
        data: {
          patientId: parseInt(patientId),
          doctorId: parseInt(doctorId),
          timeSlotId: parseInt(timeSlotId),
          date: new Date(date),
          status: 'pending',
          fee: parseFloat(fee),
          paymentStatus: 'unpaid'
        }
      });
    });
  },

  findById: async (id) => {
    const apt = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        doctor: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (!apt) return null;

    return {
      ...apt,
      contact: apt.patient.contact,
      insurance: apt.patient.insurance,
      patient_name: apt.patient.user.name,
      specialization: apt.doctor.specialization,
      location: apt.doctor.location,
      doctor_name: apt.doctor.user.name
    };
  },

  findFiltered: async (filters = {}) => {
    const where = {};
    if (filters.patientId) {
      where.patientId = parseInt(filters.patientId);
    }
    if (filters.doctorId) {
      where.doctorId = parseInt(filters.doctorId);
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const apts = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        doctor: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        timeSlot: {
          select: { timeSlot: true }
        }
      },
      orderBy: [
        { date: 'desc' }
      ]
    });

    return apts.map(apt => ({
      ...apt,
      patient_name: apt.patient.user.name,
      specialization: apt.doctor.specialization,
      location: apt.doctor.location,
      doctor_name: apt.doctor.user.name,
      time_slot: apt.timeSlot ? apt.timeSlot.timeSlot : null
    }));
  },

  updateStatus: async (id, status) => {
    return prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status }
    });
  },

  updatePaymentStatus: async (id, status) => {
    return prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { paymentStatus: status }
    });
  }
};
