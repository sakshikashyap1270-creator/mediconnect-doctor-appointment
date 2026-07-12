import prisma from '../config/db.js';

export const PaymentModel = {
  create: async (appointmentId, amount, method, transactionId) => {
    return prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.payment.create({
        data: {
          appointmentId: parseInt(appointmentId),
          amount: parseFloat(amount),
          method,
          transactionId,
          status: 'success'
        }
      });
      // Update appointment payment_status to 'paid'
      await tx.appointment.update({
        where: { id: parseInt(appointmentId) },
        data: { paymentStatus: 'paid' }
      });
      return payment;
    });
  },

  findAll: async () => {
    const payments = await prisma.payment.findMany({
      include: {
        appointment: {
          include: {
            patient: {
              include: {
                user: { select: { name: true } }
              }
            },
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

    return payments.map(p => ({
      ...p,
      patient_name: p.appointment.patient.user.name,
      doctor_name: p.appointment.doctor.user.name
    }));
  },

  findByDoctorId: async (doctorId) => {
    const payments = await prisma.payment.findMany({
      where: {
        appointment: {
          doctorId: parseInt(doctorId)
        },
        status: 'success'
      },
      include: {
        appointment: {
          include: {
            patient: {
              include: {
                user: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    return payments.map(p => ({
      ...p,
      appointment_date: p.appointment.date,
      patient_name: p.appointment.patient.user.name
    }));
  }
};
