import { PrescriptionModel } from '../models/Prescription.js';
import { AppointmentModel } from '../models/Appointment.js';
import { NotificationModel } from '../models/Notification.js';

export const writePrescription = async (req, res, next) => {
  const { appointmentId, medications, notes } = req.body;
  const doctorId = req.user.doctorId;

  try {
    if (!doctorId) {
      return res.status(403).json({ message: 'Only certified doctors can dispatch prescriptions' });
    }

    const apt = await AppointmentModel.findById(appointmentId);
    if (!apt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (apt.doctor_id !== doctorId) {
      return res.status(403).json({ message: 'You are not the doctor assigned to this appointment' });
    }

    const rx = await PrescriptionModel.create(appointmentId, medications, notes);
    
    // Auto-mark appointment as completed
    await AppointmentModel.updateStatus(appointmentId, 'completed');
    
    // Notify Patient
    await NotificationModel.create(apt.patient_id, `A digital prescription has been written for your visit on ${apt.date}.`);

    res.status(201).json(rx);
  } catch (error) {
    next(error);
  }
};

export const getPrescription = async (req, res, next) => {
  const { appointmentId } = req.params;

  try {
    const rx = await PrescriptionModel.findByAppointmentId(appointmentId);
    if (!rx) {
      return res.status(404).json({ message: 'No prescription found for this visit' });
    }
    res.status(200).json(rx);
  } catch (error) {
    next(error);
  }
};

export const getPatientPrescriptions = async (req, res, next) => {
  const patientId = req.user.patientId;

  try {
    if (!patientId) {
      return res.status(403).json({ message: 'Only registered patients can access prescriptions history' });
    }
    const list = await PrescriptionModel.findByPatientId(patientId);
    res.status(200).json(list);
  } catch (error) {
    next(error);
  }
};
