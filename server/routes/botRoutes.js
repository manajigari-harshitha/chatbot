import express from 'express';
import { saveDetails, botDetailsUpdate, botInfo, botName } from '../controllers/botControllers';
import { verifyToken } from '../middleware/verifyToken';
import upload from '../config/multer';

const router = express.Router();

router.post('/save-details', verifyToken, saveDetails);
router.post('/bot-details-update', verifyToken, upload.single('botImage'), botDetailsUpdate);
router.post('/bot-info', verifyToken, botInfo);
router.post('/get_bot_name', verifyToken, botName);



export default router;
