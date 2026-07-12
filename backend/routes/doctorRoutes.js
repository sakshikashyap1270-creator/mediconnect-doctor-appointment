import express from 'express';
import { getDoctors, getDoctorById, getSlots, addSlot, removeSlot, verifyDoctorState, getPendingDoctors } from '../controllers/doctorController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/pending', protect, restrictTo('admin'), getPendingDoctors);
router.get('/:id', getDoctorById);
router.get('/:doctorId/slots', protect, getSlots);

router.post('/slots', protect, restrictTo('doctor'), addSlot);
router.delete('/slots', protect, restrictTo('doctor'), removeSlot);

router.patch('/:id/verify', protect, restrictTo('admin'), verifyDoctorState);

export default router;
