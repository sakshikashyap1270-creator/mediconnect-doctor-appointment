import express from 'express';
import { bookAppointment, getAppointments, updateAppointmentStatus } from '../controllers/appointmentController.js';
import { writePrescription, getPrescription } from '../controllers/prescriptionController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('patient'), bookAppointment);
router.get('/', getAppointments);
router.patch('/:id', updateAppointmentStatus);

// Prescriptions nested routes
router.post('/:appointmentId/prescription', restrictTo('doctor'), writePrescription);
router.get('/:appointmentId/prescription', getPrescription);

export default router;
