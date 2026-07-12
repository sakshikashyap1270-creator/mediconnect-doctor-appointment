import { PaymentModel } from '../models/Payment.js';
import { AppointmentModel } from '../models/Appointment.js';
import { NotificationModel } from '../models/Notification.js';
import { query } from '../config/db.js';

export const processPayment = async (req, res, next) => {
  const { appointmentId, method } = req.body;
  const patientId = req.user.patientId;

  try {
    if (!patientId) {
      return res.status(403).json({ message: 'Only patients can complete payments' });
    }

    const apt = await AppointmentModel.findById(appointmentId);
    if (!apt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (apt.patient_id !== patientId) {
      return res.status(403).json({ message: 'You do not own this appointment reference' });
    }

    if (apt.payment_status === 'paid') {
      return res.status(400).json({ message: 'This appointment has already been paid for' });
    }

    const txnId = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
    
    await query('BEGIN');

    // Create payment transaction
    const pay = await PaymentModel.create(appointmentId, apt.fee, method || 'Card (Visa)', txnId);
    // Set appointment status
    await AppointmentModel.updatePaymentStatus(appointmentId, 'paid');
    // Notify doctor
    const docRes = await query('SELECT user_id FROM doctors WHERE id = $1', [apt.doctor_id]);
    if (docRes.rows.length > 0) {
      await NotificationModel.create(docRes.rows[0].user_id, `Payment of $${apt.fee} received for your scheduled appointment on ${apt.date}.`);
    }

    await query('COMMIT');

    res.status(201).json(pay);
  } catch (error) {
    await query('ROLLBACK');
    next(error);
  }
};

export const getPaymentsList = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const list = await PaymentModel.findAll();
      return res.status(200).json(list);
    } else if (req.user.role === 'doctor') {
      const list = await PaymentModel.findByDoctorId(req.user.doctorId);
      return res.status(200).json(list);
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    next(error);
  }
};
