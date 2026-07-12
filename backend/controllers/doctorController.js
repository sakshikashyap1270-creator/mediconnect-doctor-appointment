import { DoctorModel } from '../models/Doctor.js';
import { query } from '../config/db.js';
import { NotificationModel } from '../models/Notification.js';

export const getDoctors = async (req, res, next) => {
  const { search, specialization, maxFee } = req.query;

  try {
    const doctors = await DoctorModel.findFiltered({
      status: 'approved',
      search,
      specialization,
      maxFee
    });
    res.status(200).json(doctors);
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const doctor = await DoctorModel.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Fetch reviews
    const reviewsRes = await query('SELECT * FROM reviews WHERE doctor_id = $1 ORDER BY date DESC', [id]);
    doctor.reviews = reviewsRes.rows;

    res.status(200).json(doctor);
  } catch (error) {
    next(error);
  }
};

export const getSlots = async (req, res, next) => {
  const { doctorId } = req.params;
  const { date } = req.query; // date format: YYYY-MM-DD

  try {
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }
    const slots = await DoctorModel.getSlots(doctorId, date);
    res.status(200).json(slots);
  } catch (error) {
    next(error);
  }
};

export const addSlot = async (req, res, next) => {
  const { date, timeSlot } = req.body;
  const doctorId = req.user.doctorId;

  try {
    if (!doctorId) {
      return res.status(403).json({ message: 'Only registered doctors can add slots' });
    }
    if (!date || !timeSlot) {
      return res.status(400).json({ message: 'Date and time slot string are required' });
    }

    const slot = await DoctorModel.addSlot(doctorId, date, timeSlot);
    res.status(201).json(slot);
  } catch (error) {
    next(error);
  }
};

export const removeSlot = async (req, res, next) => {
  const { date, timeSlot } = req.body;
  const doctorId = req.user.doctorId;

  try {
    if (!doctorId) {
      return res.status(403).json({ message: 'Only registered doctors can remove slots' });
    }
    if (!date || !timeSlot) {
      return res.status(400).json({ message: 'Date and time slot string are required' });
    }

    const result = await DoctorModel.removeSlot(doctorId, date, timeSlot);
    res.status(200).json({ message: 'Slot removed successfully', id: result?.id });
  } catch (error) {
    next(error);
  }
};

// Admin operations
export const verifyDoctorState = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }

    const doc = await DoctorModel.update(id, { status });
    if (!doc) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Add alert notification
    await NotificationModel.create(doc.user_id, `Your credentials verification status has been updated to: ${status.toUpperCase()}`);

    res.status(200).json(doc);
  } catch (error) {
    next(error);
  }
};

export const getPendingDoctors = async (req, res, next) => {
  try {
    const doctors = await DoctorModel.findFiltered({ status: 'pending' });
    res.status(200).json(doctors);
  } catch (error) {
    next(error);
  }
};
