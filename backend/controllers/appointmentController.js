import { AppointmentModel } from '../models/Appointment.js';
import { NotificationModel } from '../models/Notification.js';
import { DoctorModel } from '../models/Doctor.js';
import { query } from '../config/db.js';

export const bookAppointment = async (req, res, next) => {
  const { doctorId, timeSlotId, date, fee } = req.body;
  const patientId = req.user.patientId;

  try {
    if (!patientId) {
      return res.status(403).json({ message: 'Only registered patients can book appointments' });
    }
    if (!doctorId || !timeSlotId || !date || !fee) {
      return res.status(400).json({ message: 'Missing parameters for appointment booking' });
    }

    // Verify slot isn't already booked
    const slotRes = await query('SELECT is_booked FROM time_slots WHERE id = $1', [timeSlotId]);
    if (slotRes.rows.length === 0 || slotRes.rows[0].is_booked) {
      return res.status(400).json({ message: 'Selected time slot is unavailable' });
    }

    const newApt = await AppointmentModel.create(patientId, doctorId, timeSlotId, date, fee);
    
    // Notify doctor
    const doc = await DoctorModel.findById(doctorId);
    if (doc) {
      await NotificationModel.create(doc.user_id, `New appointment booking request received from ${req.user.name} for ${date}.`);
    }

    res.status(201).json(newApt);
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    let filters = {};
    if (req.user.role === 'patient') {
      filters.patientId = req.user.patientId;
    } else if (req.user.role === 'doctor') {
      filters.doctorId = req.user.doctorId;
    }
    
    const list = await AppointmentModel.findFiltered(filters);
    res.status(200).json(list);
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved', 'cancelled', 'completed'

  try {
    const apt = await AppointmentModel.findById(id);
    if (!apt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authority checks
    if (req.user.role === 'patient' && status !== 'cancelled') {
      return res.status(403).json({ message: 'Patients can only cancel appointments' });
    }
    if (req.user.role === 'doctor' && req.user.doctorId !== apt.doctor_id) {
      return res.status(403).json({ message: 'You are not the designated physician for this consultation' });
    }

    // Update DB
    const updated = await AppointmentModel.updateStatus(id, status);
    
    // If cancelled, free up the time slot
    if (status === 'cancelled' && apt.time_slot_id) {
      await query('UPDATE time_slots SET is_booked = FALSE WHERE id = $1', [apt.time_slot_id]);
    }

    // Notify patient
    await NotificationModel.create(apt.patient_id, `Your appointment schedule with ${apt.doctor_name} has been updated to: ${status.toUpperCase()}`);

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
