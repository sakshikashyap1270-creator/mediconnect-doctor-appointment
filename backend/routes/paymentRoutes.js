import express from 'express';
import { processPayment, getPaymentsList } from '../controllers/paymentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('patient'), processPayment);
router.get('/', restrictTo('admin', 'doctor'), getPaymentsList);

export default router;
