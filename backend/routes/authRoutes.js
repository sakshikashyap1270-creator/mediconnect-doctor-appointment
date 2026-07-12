import express from 'express';
import { login, signupPatient, signupDoctor } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register-patient', signupPatient);
router.post('/register-doctor', signupDoctor);

export default router;
