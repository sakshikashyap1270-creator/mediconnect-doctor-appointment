import prisma from '../config/db.js';

export const PrescriptionModel = {
  create: async (appointmentId, medications, notes) => {
    return prisma.prescription.upsert({
      where: { appointmentId: parseInt(appointmentId) },
      update: {
        medications,
        notes
      },
      create: {
        appointmentId: parseInt(appointmentId),
        medications,
        notes
      }
    });
  },

  findByAppointmentId: async (appointmentId) => {
    return prisma.prescription.findUnique({
      where: { appointmentId: parseInt(appointmentId) }
    });
  },

  findByPatientId: async (patientId) => {
    const rx = await prisma.prescription.findMany({
      where: {
        appointment: {
          patientId: parseInt(patientId)
        }
      },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
                user: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    return rx.map(r => ({
      ...r,
      doctor_name: r.appointment.doctor.user.name,
      specialization: r.appointment.doctor.specialization,
      appointment_date: r.appointment.date
    }));
  }
};
