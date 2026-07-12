import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/profileController.js';
import { uploadRecord, getRecords, deleteRecord } from '../controllers/medicalRecordController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getProfile);
router.patch('/', updateProfile);
router.patch('/password', changePassword);

// Medical Records routes integrated into Profile context
router.post('/medical-records', restrictTo('patient'), upload.single('report'), uploadRecord);
router.get('/medical-records', restrictTo('patient'), getRecords);
router.delete('/medical-records/:id', restrictTo('patient'), deleteRecord);

export default router;
