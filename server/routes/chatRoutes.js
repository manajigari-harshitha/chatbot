import express from 'express';
import { clearchat, fetchMessages, chatAccess, checkAccess, message } from '../controllers/chatControllers';
import { verifyToken } from '../middleware/verifyToken';

const router = express.Router();

router.post('/check-access', verifyToken, checkAccess);
router.post('/chat', verifyToken, checkAccess, chatAccess );
router.post('/fetch_messages', verifyToken, fetchMessages);
router.post('/clearchat', verifyToken, clearchat);
router.post('/messages', verifyToken, message);



// Add more authentication routes...

export default router;
