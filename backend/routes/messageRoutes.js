import express from 'express';
import { sendMessage, getMessages, getChatContacts } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/contacts', getChatContacts);
router.post('/', sendMessage);
router.get('/:userId', getMessages);

export default router;
